package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/fifa-team/hifzhly-backend/internal/model"
	"github.com/redis/go-redis/v9"
)

// RateLimiter mengelola pembatasan jumlah request per IP untuk mencegah serangan brute-force & DoS
type RateLimiter struct {
	redisClient *redis.Client
	mu          sync.Mutex
	inMemory    map[string]*clientBucket
	cleanupDone chan struct{}
}

type clientBucket struct {
	count    int
	lastSeen time.Time
	resetAt  time.Time
}

// NewRateLimiter menginisialisasi rate limiter dengan dukungan Redis & fallback in-memory otomatis
func NewRateLimiter(redisClient *redis.Client) *RateLimiter {
	rl := &RateLimiter{
		redisClient: redisClient,
		inMemory:    make(map[string]*clientBucket),
		cleanupDone: make(chan struct{}),
	}

	// Worker pembersih memory leak berjalan di latar belakang setiap 2 menit
	go rl.startCleanup(2 * time.Minute)

	return rl
}

// Close menghentikan worker pembersih in-memory
func (rl *RateLimiter) Close() {
	close(rl.cleanupDone)
}

func (rl *RateLimiter) startCleanup(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rl.mu.Lock()
			now := time.Now()
			for k, b := range rl.inMemory {
				if now.After(b.resetAt) && now.Sub(b.lastSeen) > 5*time.Minute {
					delete(rl.inMemory, k)
				}
			}
			rl.mu.Unlock()
		case <-rl.cleanupDone:
			return
		}
	}
}

// Limit menghasilkan middleware HTTP yang membatasi request per IP address
func (rl *RateLimiter) Limit(maxRequests int, window time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := getClientIP(r)
			key := fmt.Sprintf("ratelimit:%s:%s", r.URL.Path, ip)

			allowed, remaining, resetSec, err := rl.allowRequest(r.Context(), key, maxRequests, window)
			if err != nil {
				// Fail-open: jika rate limiter mengalami kendala, tetap layani pengguna yang sah
				next.ServeHTTP(w, r)
				return
			}

			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

			if !allowed {
				w.Header().Set("Retry-After", fmt.Sprintf("%d", resetSec))
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				json.NewEncoder(w).Encode(model.ErrorResponse{
					Error: fmt.Sprintf("Terlalu banyak permintaan (Rate limit exceeded). Demi keamanan akun dari ancaman brute-force, silakan coba lagi dalam %d detik.", resetSec),
				})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func (rl *RateLimiter) allowRequest(ctx context.Context, key string, maxRequests int, window time.Duration) (bool, int, int, error) {
	// 1. Prioritaskan Redis jika terhubung (Distributed Sliding Window)
	if rl.redisClient != nil {
		ctxTimeout, cancel := context.WithTimeout(ctx, 300*time.Millisecond)
		defer cancel()

		pipe := rl.redisClient.Pipeline()
		incrCmd := pipe.Incr(ctxTimeout, key)
		pipe.Expire(ctxTimeout, key, window)
		_, err := pipe.Exec(ctxTimeout)

		if err == nil {
			count := int(incrCmd.Val())
			if count > maxRequests {
				ttl, _ := rl.redisClient.TTL(ctxTimeout, key).Result()
				resetSec := int(ttl.Seconds())
				if resetSec <= 0 {
					resetSec = int(window.Seconds())
				}
				return false, 0, resetSec, nil
			}
			remaining := maxRequests - count
			if remaining < 0 {
				remaining = 0
			}
			return true, remaining, int(window.Seconds()), nil
		}
		// Jika koneksi Redis bermasalah, otomatis fallback ke In-Memory di bawah
	}

	// 2. High-Performance In-Memory Limiter
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	bucket, exists := rl.inMemory[key]
	if !exists || now.After(bucket.resetAt) {
		rl.inMemory[key] = &clientBucket{
			count:    1,
			lastSeen: now,
			resetAt:  now.Add(window),
		}
		return true, maxRequests - 1, int(window.Seconds()), nil
	}

	bucket.count++
	bucket.lastSeen = now
	resetSec := int(bucket.resetAt.Sub(now).Seconds())
	if resetSec <= 0 {
		resetSec = 1
	}

	if bucket.count > maxRequests {
		return false, 0, resetSec, nil
	}

	remaining := maxRequests - bucket.count
	if remaining < 0 {
		remaining = 0
	}
	return true, remaining, resetSec, nil
}

// getClientIP mengekstrak IP asli klien dari header proxy (X-Forwarded-For, X-Real-IP) atau RemoteAddr
func getClientIP(r *http.Request) string {
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		ips := strings.Split(xff, ",")
		clientIP := strings.TrimSpace(ips[0])
		if clientIP != "" {
			return clientIP
		}
	}

	xri := r.Header.Get("X-Real-IP")
	if xri != "" {
		clientIP := strings.TrimSpace(xri)
		if clientIP != "" {
			return clientIP
		}
	}

	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

