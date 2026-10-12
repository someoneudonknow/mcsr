package apperror

import (
	"errors"
	"net/http"
)

type AppError struct {
	Code    string
	Message string
	Status  int
	Fields  []FieldError
	Err     error
}

type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func New(status int, code, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Status:  status,
	}
}

func Wrap(err error, status int, code, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Status:  status,
		Err:     err,
	}
}

func (e *AppError) WithFields(fields []FieldError) *AppError {
	cloned := *e
	cloned.Fields = fields
	return &cloned
}

func As(err error) (*AppError, bool) {
	var target *AppError
	ok := errors.As(err, &target)
	return target, ok
}

var (
	ErrNotFound           = New(http.StatusNotFound, "NOT_FOUND", "The requested resource was not found")
	ErrUnauthorized       = New(http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required")
	ErrInvalidCredentials = New(http.StatusUnauthorized, "INVALID_CREDENTIALS", "Invalid email or password")
	ErrForbidden          = New(http.StatusForbidden, "FORBIDDEN", "You do not have permission to perform this action")
	ErrConflict           = New(http.StatusConflict, "CONFLICT", "This resource already exists")
	ErrBadRequest         = New(http.StatusBadRequest, "BAD_REQUEST", "The request could not be understood")
	ErrInternal           = New(http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
)
