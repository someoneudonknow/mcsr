package httpserver

import (
	"net/http"
	"spatial-service/internal/config"
	"spatial-service/internal/platform/logger"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"go.uber.org/zap"
)

func RequestID() echo.MiddlewareFunc {
	return middleware.RequestID()
}

func Recover() echo.MiddlewareFunc {
	return middleware.Recover()
}

func CORS(cfg config.CORSConfig) echo.MiddlewareFunc {
	return middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     cfg.AllowOrigins,
		AllowMethods:     cfg.AllowMethods,
		AllowHeaders:     cfg.AllowHeaders,
		AllowCredentials: cfg.AllowCredentials,
		ExposeHeaders:    cfg.ExposeHeaders,
		MaxAge:           cfg.MaxAge,
	})
}

func RequestLogger(l *logger.Logger) echo.MiddlewareFunc {
	return middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		HandleError:  true,
		LogURI:       true,
		LogRequestID: true,
		LogMethod:    true,
		LogStatus:    true,
		LogValuesFunc: func(c *echo.Context, v middleware.RequestLoggerValues) error {
			fields := []zap.Field{
				zap.String("method", v.Method),
				zap.String("path", v.URI),
				zap.Int("status", v.Status),
				zap.Duration("latency", time.Since(v.StartTime)),
				zap.String("ip", c.RealIP()),
				zap.String("request_id", v.RequestID),
			}

			if v.Error != nil {
				fields = append(fields, zap.Error(v.Error))

				if v.Status >= http.StatusInternalServerError {
					l.ErrorS("request failed", fields...)

				} else {
					l.WarnS("request failed", fields...)
				}

				return nil
			}

			l.InfoS("request handled", fields...)
			return nil
		},
	})
}
