package validator

import (
	govalidator "github.com/go-playground/validator/v10"
)

type Validate struct {
	v *govalidator.Validate
}

func New() *Validate {
	v := govalidator.New(govalidator.WithRequiredStructEnabled())
	return &Validate{v}
}

func (cv *Validate) Validate(i interface{}) error {
	return cv.v.Struct(i)
}
