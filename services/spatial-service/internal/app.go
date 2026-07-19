package internal

import (
	"spatial-service/internal/config"
	"spatial-service/internal/health"
	"spatial-service/internal/platform/httpserver"
	"spatial-service/internal/platform/logger"
	"spatial-service/internal/platform/migrate"
	"spatial-service/internal/platform/postgres"
	"spatial-service/internal/platform/redis"
	"spatial-service/internal/platform/validator"

	"go.uber.org/fx"
)

var Modules = fx.Options(
	config.Module,
	logger.Module,
	validator.Module,
	redis.Module,
	postgres.Module,
	migrate.Module,
	httpserver.Module,
	health.Module,
)
