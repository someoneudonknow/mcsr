package logger

import (
	"spatial-service/internal/config"

	"gopkg.in/natefinch/lumberjack.v2"
)

func NewLummerjack(cfg *config.Config) *lumberjack.Logger {
	return &lumberjack.Logger{
		Filename:   cfg.Logger.Filename,
		MaxSize:    cfg.Logger.MaxSize,
		MaxAge:     cfg.Logger.MaxAge,
		MaxBackups: cfg.Logger.MaxBackups,
		Compress:   cfg.Logger.Compress,
	}
}
