package redis

import (
	"context"
	"spatial-service/internal/platform/logger"
	"time"

	"github.com/redis/go-redis/v9"
)

const SLOW_COMMAND_THRESHOLD = 200 * time.Millisecond

type loggerHook struct {
	l *logger.Logger
}

func newLoggingHook(l *logger.Logger) *loggerHook {
	return &loggerHook{l}
}

func (l *loggerHook) DialHook(next redis.DialHook) redis.DialHook {
	return next
}

func (l *loggerHook) ProcessHook(next redis.ProcessHook) redis.ProcessHook {
	return func(ctx context.Context, cmd redis.Cmder) error {
		start := time.Now()
		err := next(ctx, cmd)
		elapsed := time.Since(start)

		switch {
		case err != nil && err != redis.Nil:
			l.l.Errorf("redis command failed: %s (%s): %v", cmd.Name(), elapsed, err)
		case elapsed > SLOW_COMMAND_THRESHOLD:
			l.l.Warnf("slow redis command: %s took %s", cmd.Name(), elapsed)
		}

		return err
	}
}

func (l *loggerHook) ProcessPipelineHook(next redis.ProcessPipelineHook) redis.ProcessPipelineHook {
	return func(ctx context.Context, cmds []redis.Cmder) error {
		start := time.Now()
		err := next(ctx, cmds)
		elapsed := time.Since(start)

		switch {
		case err != nil && err != redis.Nil:
			l.l.Errorf("redis pipeline failed (%d cmds, %s): %v", len(cmds), elapsed, err)
		case elapsed > SLOW_COMMAND_THRESHOLD:
			l.l.Warnf("slow redis pipeline: %d cmds took %s", len(cmds), elapsed)
		}

		return err
	}
}
