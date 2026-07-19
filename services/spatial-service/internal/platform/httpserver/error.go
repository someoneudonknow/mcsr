package httpserver

import (
	"errors"
	"net/http"
	"spatial-service/internal/config"
	"spatial-service/internal/platform/logger"
	"spatial-service/pkg/apperror"

	"github.com/labstack/echo/v5"
)

type errorResponse struct {
	Success bool      `json:"success"`
	Error   errorBody `json:"error"`
}

type errorBody struct {
	Code      string                `json:"code"`
	Message   string                `json:"message"`
	RequestID string                `json:"request_id"`
	Fields    []apperror.FieldError `json:"fields,omitempty"`
}

func NewHttpErrorHandler(l *logger.Logger, cfg *config.Config) echo.HTTPErrorHandler {
	isDev := cfg.Env != "production"

	return func(c *echo.Context, err error) {
		if resp, uErr := echo.UnwrapResponse(c.Response()); uErr == nil {
			if resp.Committed {
				return
			}
		}

		reqId := c.Response().Header().Get(echo.HeaderXRequestID)
		status, body := toErrorResponse(err, reqId, isDev)

		if c.Request().Method == http.MethodHead {
			_ = c.NoContent(status)
			return
		}

		_ = c.JSON(status, body)
	}
}

func toErrorResponse(err error, reqId string, isDev bool) (int, errorResponse) {
	var appErr *apperror.AppError
	if errors.As(err, &appErr) {
		return appErr.Status, errorResponse{
			Success: false,
			Error: errorBody{
				Code:      appErr.Code,
				Message:   appErr.Message,
				RequestID: reqId,
				Fields:    appErr.Fields,
			},
		}
	}

	var sc echo.HTTPStatusCoder
	if errors.As(err, &sc) {
		code := sc.StatusCode()

		msg := http.StatusText(code)
		var he *echo.HTTPError
		if errors.As(err, &he) && he.Message != "" {
			msg = he.Message
		}

		return code, errorResponse{
			Success: false,
			Error: errorBody{
				Code:      httpErrorCode(code),
				Message:   msg,
				RequestID: reqId,
			},
		}
	}

	message := "An unexpected error occurred"
	if isDev {
		message = err.Error()
	}
	return http.StatusInternalServerError, errorResponse{
		Success: false,
		Error: errorBody{
			Code:      "INTERNAL_ERROR",
			Message:   message,
			RequestID: reqId,
		},
	}
}

func httpErrorCode(status int) string {
	switch status {
	case http.StatusNotFound:
		return "NOT_FOUND"
	case http.StatusBadRequest:
		return "BAD_REQUEST"
	case http.StatusUnauthorized:
		return "UNAUTHORIZED"
	case http.StatusForbidden:
		return "FORBIDDEN"
	case http.StatusInternalServerError:
		return "INTERNAL_SERVER_ERROR"
	case http.StatusConflict:
		return "CONFLICT"
	case http.StatusUnprocessableEntity:
		return "UNPROCESSABLE_ENTITY"
	default:
		return "HTTP_ERROR"
	}
}
