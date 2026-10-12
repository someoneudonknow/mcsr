package internal

import (
	"org-service/internal/config"
	"org-service/internal/health"
	"org-service/internal/platform/grpc"
	"org-service/internal/platform/httpserver"
	"org-service/internal/platform/logger"
	"org-service/internal/platform/migrate"
	"org-service/internal/platform/postgres"
	"org-service/internal/platform/redis"
	"org-service/internal/platform/s3"
	"org-service/internal/platform/validator"

	"go.uber.org/fx"
)

var Modules = fx.Options(
	config.Module,
	logger.Module,
	validator.Module,
	redis.Module,
	postgres.Module,
	migrate.Module,
	s3.Module,
	grpc.Module,
	httpserver.Module,
	health.Module,
)
