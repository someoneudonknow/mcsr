package redis

import (
	"context"
	"fmt"
	"spatial-service/pkg/config"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	Client *redis.Client
}

const INITIAL_PING_TIMEOUT = 10 * time.Second

func NewClient(cfg config.RedisConfig) (*RedisClient, error) {
	client := redis.NewClient(&redis.Options{
		DB:              cfg.DB,
		Username:        cfg.Username,
		Password:        cfg.Password,
		Addr:            fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		DialTimeout:     time.Duration(cfg.DialTimeout) * time.Second,
		MaxRetries:      cfg.MaxRetries,
		MinRetryBackoff: time.Duration(cfg.MinRetryBackoff) * time.Millisecond,
		MaxRetryBackoff: time.Duration(cfg.MaxRetryBackoff) * time.Millisecond,
	})

	ctx, cancel := context.WithTimeout(context.Background(), INITIAL_PING_TIMEOUT)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis connection failed: %w", err)
	}

	return &RedisClient{Client: client}, nil
}
