package main

import (
	"org-service/internal"
	"org-service/internal/platform/logger"

	"go.uber.org/fx"
	"go.uber.org/fx/fxevent"
)

func main() {
	app := fx.New(internal.Modules, fx.WithLogger(func(logger *logger.Logger) fxevent.Logger {
		return &fxevent.ZapLogger{Logger: logger.Logger()}
	}))
	app.Run()
}
