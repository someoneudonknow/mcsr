package migrate

import (
	"errors"
	"fmt"
	"spatial-service/internal/config"
	"spatial-service/internal/migrations"
	"spatial-service/internal/platform/logger"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"gorm.io/gorm"
)

func Run(db *gorm.DB, log *logger.Logger, cfg *config.Config) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("run migration: %w", err)
	}

	driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("migrate driver: %w", err)
	}

	src, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return fmt.Errorf("migration source %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", src, "postgres", driver)
	if err != nil {
		return fmt.Errorf("migrate init: %w", err)
	}

	before, _, _ := m.Version()

	if err := m.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			log.Infof("migrations up to date at version %d", before)
			return nil
		}
		return fmt.Errorf("migrate up: %w", err)
	}

	after, _, _ := m.Version()
	log.Infof("migrations applied: %d -> %d", before, after)

	return nil
}
