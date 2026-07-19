package config

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	Env      string         `mapstructure:"env"`
	Server   ServerConfig   `mapstructure:"server"`
	CORS     CORSConfig     `mapstructure:"cors"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	Logger   LoggerConfig   `mapstructure:"logger"`
}

type ServerConfig struct {
	ReadTimeout  time.Duration `mapstructure:"read_timeout"`
	WriteTimeout time.Duration `mapstructure:"write_timeout"`
	Port         int           `mapstructure:"port"`
	APIPrefix    string        `mapstructure:"api_prefix"`
}

type CORSConfig struct {
	AllowOrigins     []string `mapstructure:"allow_origins"`
	AllowMethods     []string `mapstructure:"allow_methods"`
	AllowHeaders     []string `mapstructure:"allow_headers"`
	ExposeHeaders    []string `mapstructure:"expose_headers"`
	MaxAge           int      `mapstructure:"max_age"`
	AllowCredentials bool     `mapstructure:"allow_credentials"`
}

type DatabaseConfig struct {
	MaxOpenConns    int    `mapstructure:"max_open_conns"`
	MaxIdleConns    int    `mapstructure:"max_idle_conns"`
	Port            int    `mapstructure:"port"`
	Type            string `mapstructure:"type"`
	Host            string `mapstructure:"host"`
	User            string `mapstructure:"user"`
	Password        string `mapstructure:"password"`
	ConnMaxLifetime string `mapstructure:"conn_max_lifetime"`
	DBName          string `mapstructure:"dbname"`
	SSLMode         string `mapstructure:"ssl_mode"`
}

type RedisConfig struct {
	PoolTimeout  time.Duration `mapstructure:"pool_timeout"` // Maximum time client waits for a connection from the pool if the pool is exhausted. If reached, an error is returned.
	DialTimeout  time.Duration `mapstructure:"dial_timeout"`
	ReadTimeout  time.Duration `mapstructure:"read_timeout"`
	WriteTimeout time.Duration `mapstructure:"write_timeout"`
	DB           int           `mapstructure:"db"`
	MaxRetries   int           `mapstructure:"max_retries"`
	PoolSize     int           `mapstructure:"pool_size"`
	MinIdleConns int           `mapstructure:"min_idle_conns"`
	Addr         string        `mapstructure:"addr"`
	User         string        `mapstructure:"user"`
	Password     string        `mapstructure:"password"`
	TLSEnabled   bool          `mapstructure:"tls_enabled"`
}

type LoggerConfig struct {
	Level      string `mapstructure:"level"`
	Filename   string `mapstructure:"filename"`
	MaxSize    int    `mapstructure:"max_size"`
	MaxBackups int    `mapstructure:"max_backups"`
	Compress   bool   `mapstructure:"compress"`
	MaxAge     int    `mapstructure:"max_age"`
}

func Load() (*Config, error) {
	v := viper.New()

	_ = godotenv.Load("./.env")

	env := getEnv("APP_ENV", "development")

	v.SetConfigName("config." + env)
	v.SetConfigType("yaml")
	v.AddConfigPath("./config")
	v.AddConfigPath(".")

	v.SetEnvPrefix("APP")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	setDefaults(v)
	bindEnv(v)

	if err := v.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config: %w", err)
	}
	cfg.Env = env

	return &cfg, nil
}

func bindEnv(v *viper.Viper) {
	v.BindEnv("redis.addr")
	v.BindEnv("redis.user")
	v.BindEnv("redis.password")

	v.BindEnv("database.host")
	v.BindEnv("database.port")
	v.BindEnv("database.user")
	v.BindEnv("database.password")
}

func setDefaults(v *viper.Viper) {
	v.SetDefault("server.port", 8080)
	v.SetDefault("server.read_timeout", "10s")
	v.SetDefault("server.write_timeout", "10s")
	v.SetDefault("server.api_prefix", "/api")

	v.SetDefault("database.type", "postgres")
	v.SetDefault("database.ssl_mode", "disable")
	v.SetDefault("database.max_open_conns", 25)
	v.SetDefault("database.max_idle_conns", 5)
	v.SetDefault("database.conn_max_lifetime", "5m")

	v.SetDefault("redis.db", 0)
	v.SetDefault("redis.pool_size", 50)
	v.SetDefault("redis.min_idle_conns", 20)
	v.SetDefault("redis.dial_timeout", "5s")
	v.SetDefault("redis.read_timeout", "2s")
	v.SetDefault("redis.write_timeout", "2s")
	v.SetDefault("redis.pool_timeout", "5s")
	v.SetDefault("redis.max_retries", 3)

	v.SetDefault("logger.level", "info")
	v.SetDefault("logger.filename", "/logs/app.log")
	v.SetDefault("logger.max_size", 500)
	v.SetDefault("logger.max_backups", 10)
	v.SetDefault("logger.compress", true)
	v.SetDefault("logger.max_age", 30)
}

func getEnv(key string, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
