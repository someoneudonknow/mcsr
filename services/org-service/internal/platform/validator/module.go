package validator

import "go.uber.org/fx"

const MODULE_NAME = "validator"

var Module = fx.Module(MODULE_NAME, fx.Provide(New))
