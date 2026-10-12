package redis

import "go.uber.org/fx"

const MODULE_NAME = "redis"

var Module = fx.Module(MODULE_NAME, fx.Provide(New), fx.Invoke(RegisterLifecycle))
