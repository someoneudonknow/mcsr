package redis

import (
	"context"
	"crypto/tls"
	"fmt"
	"spatial-service/internal/config"
	"spatial-service/internal/platform/logger"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/fx"
)

func New(lc fx.Lifecycle, cfg *config.Config, l *logger.Logger) *redis.Client {
	opts := &redis.Options{
		Addr:         cfg.Redis.Addr,
		DB:           cfg.Redis.DB,
		Username:     cfg.Redis.User,
		Password:     cfg.Redis.Password,
		PoolSize:     cfg.Redis.PoolSize,
		MinIdleConns: cfg.Redis.MinIdleConns,
		DialTimeout:  cfg.Redis.DialTimeout,
		ReadTimeout:  cfg.Redis.ReadTimeout,
		WriteTimeout: cfg.Redis.WriteTimeout,
		PoolTimeout:  cfg.Redis.PoolTimeout,
		MaxRetries:   cfg.Redis.MaxRetries,
	}

	if cfg.Redis.TLSEnabled {
		opts.TLSConfig = &tls.Config{MinVersion: tls.VersionTLS12}
	}

	client := redis.NewClient(opts)
	client.AddHook(newLoggingHook(l))

	return client
}

func RegisterLifecycle(lc fx.Lifecycle, client *redis.Client, cfg *config.Config, l *logger.Logger) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
			defer cancel()

			if err := client.Ping(pingCtx).Err(); err != nil {
				return fmt.Errorf("connect redis: %w", err)
			}
			l.Infof("connected to redis at %s", cfg.Redis.Addr)
			return nil
		},
		OnStop: func(ctx context.Context) error {
			return client.Close()
		},
	})
}
