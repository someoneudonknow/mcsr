package main

import (
	"fmt"
	"os"
	"spatial-service/internal/app"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	app := app.NewApp()
	defer app.Close()

	return app.Run()
}
