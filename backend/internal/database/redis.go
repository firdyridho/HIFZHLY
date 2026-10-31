package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient(host, port string) *redis.Client {
	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "6379"
	}

	addr := fmt.Sprintf("%s:%s", host, port)
	client := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     "",
		DB:           0,
		DialTimeout:  3 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("[Redis Warning] Tidak dapat menghubungi Redis pada %s (%v). Mode direct fallback aktif.", addr, err)
	} else {
		log.Printf("[Redis] Berhasil terhubung ke Redis pada %s!", addr)
	}

	return client
}
