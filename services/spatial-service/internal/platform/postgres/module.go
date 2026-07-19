package postgres

import "go.uber.org/fx"

const MODULE_NAME = "postgres"

var Module = fx.Module(MODULE_NAME, fx.Provide(New), fx.Invoke(RegisterLifecycle))
