package s3

import "go.uber.org/fx"

const MODULE_NAME = "s3"

var Module = fx.Module(MODULE_NAME, fx.Provide(New, NewStorage), fx.Invoke(RegisterLifecycle))
