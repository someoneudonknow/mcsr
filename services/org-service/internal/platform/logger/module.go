package logger

import "go.uber.org/fx"

const MODULE_NANE = "logger"

var Module = fx.Module(MODULE_NANE, fx.Provide(NewLummerjack, New))
