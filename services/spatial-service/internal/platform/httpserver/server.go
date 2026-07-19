package httpserver

import (
	"context"
	"fmt"
	"net/http"
	"spatial-service/internal/config"
	"spatial-service/internal/platform/logger"
	"spatial-service/internal/platform/validator"
	"time"

	"github.com/labstack/echo/v5"
	"go.uber.org/fx"
	"go.uber.org/zap"
)

func NewEcho(v *validator.Validate, cfg *config.Config, l *logger.Logger) *echo.Echo {
	e := echo.New()

	e.Validator = v
	e.HTTPErrorHandler = NewHttpErrorHandler(l, cfg)

	e.Use(RequestID())
	e.Use(Recover())
	e.Use(CORS(cfg.CORS))
	e.Use(RequestLogger(l))

	return e
}

func RegisterLifecycle(
	lc fx.Lifecycle,
	e *echo.Echo,
	cfg *config.Config,
	logger *logger.Logger,
) {
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:      e,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go func() {
				if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					logger.Fatal("http server crashed", zap.Error(err))
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			logger.Info("http server stoping")
			shutdownCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
			defer cancel()
			return srv.Shutdown(shutdownCtx)
		},
	})
}
