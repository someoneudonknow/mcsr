package migrate

import "go.uber.org/fx"

const MODULE_NAME = "migrate"

var Module = fx.Module(MODULE_NAME, fx.Invoke(Run))
