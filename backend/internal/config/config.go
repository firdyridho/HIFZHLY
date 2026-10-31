package config

import (
	"os"
)

type Config struct {
	AppPort     string
	AppEnv      string
	DatabaseURL string
	RedisHost   string
	RedisPort   string
	JWTSecret   string
}

func LoadConfig() *Config {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	return &Config{
		AppPort:     port,
		AppEnv:      env,
		DatabaseURL: os.Getenv("DATABASE_URL"),
		RedisHost:   os.Getenv("REDIS_HOST"),
		RedisPort:   os.Getenv("REDIS_PORT"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
	}
}

