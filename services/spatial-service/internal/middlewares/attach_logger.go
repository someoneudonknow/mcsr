package middlewares

import (
	"spatial-service/pkg/logger"

	"github.com/gin-gonic/gin"
)

func AttachLogger(l *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.WithContext(logger.ToContext(c.Request.Context(), l))
		c.Next()
	}
}
