package apperror

import (
	"net/http"

	"github.com/go-playground/validator/v10"
)

func FromValidation(err error) *AppError {
	var fields []FieldError

	if verrs, ok := err.(validator.ValidationErrors); ok {
		for _, verr := range verrs {
			fields = append(fields, FieldError{
				// TODO: remove this with the real error
				Field:   verr.Field(),
				Message: verr.Tag(),
			})
		}
	}

	appErr := New(http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Validation failed")
	appErr.Err = err
	return appErr.WithFields(fields)
}
