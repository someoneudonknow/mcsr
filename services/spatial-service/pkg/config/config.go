package config

import (
	"fmt"
	"strings"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

func Load(path string) (*Config, error) {
	cfg := viper.New()

	_ = godotenv.Load(fmt.Sprintf("%s/.env", path))

	cfg.SetConfigName("config")
	cfg.SetConfigType("yaml")
	cfg.AddConfigPath(path)
	cfg.AutomaticEnv()
	cfg.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	setDefault(cfg)

	if err := cfg.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("error reading config file: %w", err)
	}

	var config Config
	if err := cfg.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("error unmarshalling config: %w", err)
	}

	return &config, nil
}

func setDefault(v *viper.Viper) {
	// App defaults
	v.SetDefault("app.port", 3001)
	v.SetDefault("app.env", "dev")
	v.SetDefault("app.host", "127.0.0.1")

	// Redis defaults
	v.SetDefault("redis.host", "127.0.0.1")
	v.SetDefault("redis.password", "supersecretpass")
	v.SetDefault("redis.db", 0)
	v.SetDefault("redis.port", 6379)
	v.SetDefault("redis.username", "spatial_service_user")

	// Logger defaults
	v.SetDefault("logger.level", "debug")
	v.SetDefault("logger.filename", "/logs/app.log")
	v.SetDefault("logger.max_size", 500)
	v.SetDefault("logger.max_backups", 10)
	v.SetDefault("logger.compress", true)
	v.SetDefault("logger.max_age", 30)

	// Websocket defaults
	v.SetDefault("websocket.read_buffer_size", 1024)
	v.SetDefault("websocket.write_buffer_size", 1024)
	v.SetDefault("websocket.write_wait", 10)
	v.SetDefault("websocket.pong_wait", 60)
	v.SetDefault("websocket.max_message_size", 512)
	v.SetDefault("websocket.origins", []string{"*"})
}
