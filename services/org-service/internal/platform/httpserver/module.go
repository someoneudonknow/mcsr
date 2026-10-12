package httpserver

import "go.uber.org/fx"

const MODULE_NAME = "httpserver"

var Module = fx.Module(MODULE_NAME, fx.Provide(NewEcho, NewAPIRouter), fx.Invoke(RegisterLifecycle))
