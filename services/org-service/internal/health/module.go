package health

import "go.uber.org/fx"

const MODULE_NAME = "health"

var Module = fx.Module(MODULE_NAME, fx.Provide(NewHandler), fx.Invoke(RegisterRoutes))