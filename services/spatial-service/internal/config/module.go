package config

import "go.uber.org/fx"

const MODULE_NAME = "config"

var Module = fx.Module(MODULE_NAME, fx.Provide(Load))
