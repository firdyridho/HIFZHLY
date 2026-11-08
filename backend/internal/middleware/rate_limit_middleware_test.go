package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestRateLimiter_InMemoryLimit(t *testing.T) {
	rl := NewRateLimiter(nil) // mode in-memory tanpa Redis
	defer rl.Close()

	// Limit: maksimal 3 request per 1 detik
	limitMiddleware := rl.Limit(3, 1*time.Second)

	dummyHandler := limitMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}))

	// Request 1: harus sukses (remaining 2)
	req1 := httptest.NewRequest("POST", "/api/v1/auth/login", nil)
	req1.RemoteAddr = "192.168.1.100:12345"
	rr1 := httptest.NewRecorder()
	dummyHandler.ServeHTTP(rr1, req1)
	if rr1.Code != http.StatusOK {
		t.Fatalf("Expected 200 on request 1, got %d", rr1.Code)
	}
	if rem := rr1.Header().Get("X-RateLimit-Remaining"); rem != "2" {
		t.Errorf("Expected remaining 2, got %s", rem)
	}

	// Request 2: harus sukses (remaining 1)
	req2 := httptest.NewRequest("POST", "/api/v1/auth/login", nil)
	req2.RemoteAddr = "192.168.1.100:12346"
	rr2 := httptest.NewRecorder()
	dummyHandler.ServeHTTP(rr2, req2)
	if rr2.Code != http.StatusOK {
		t.Fatalf("Expected 200 on request 2, got %d", rr2.Code)
	}

	// Request 3: harus sukses (remaining 0)
	req3 := httptest.NewRequest("POST", "/api/v1/auth/login", nil)
	req3.RemoteAddr = "192.168.1.100:12347"
	rr3 := httptest.NewRecorder()
	dummyHandler.ServeHTTP(rr3, req3)
	if rr3.Code != http.StatusOK {
		t.Fatalf("Expected 200 on request 3, got %d", rr3.Code)
	}

	// Request 4: harus ditolak dengan 429 Too Many Requests
	req4 := httptest.NewRequest("POST", "/api/v1/auth/login", nil)
	req4.RemoteAddr = "192.168.1.100:12348"
	rr4 := httptest.NewRecorder()
	dummyHandler.ServeHTTP(rr4, req4)
	if rr4.Code != http.StatusTooManyRequests {
		t.Fatalf("Expected 429 on request 4, got %d", rr4.Code)
	}
	if retry := rr4.Header().Get("Retry-After"); retry == "" {
		t.Errorf("Expected Retry-After header, got empty")
	}

	// Request dari IP lain (192.168.1.200) harus tetap diizinkan
	reqOther := httptest.NewRequest("POST", "/api/v1/auth/login", nil)
	reqOther.RemoteAddr = "192.168.1.200:12345"
	rrOther := httptest.NewRecorder()
	dummyHandler.ServeHTTP(rrOther, reqOther)
	if rrOther.Code != http.StatusOK {
		t.Fatalf("Expected 200 for another IP, got %d", rrOther.Code)
	}
}

