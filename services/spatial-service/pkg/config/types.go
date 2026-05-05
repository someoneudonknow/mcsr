package config

type Config struct {
	App      AppConfig    `mapstructure:"app"`
	Redis    RedisConfig  `mapstructure:"redis"`
	Logger   LoggerConfig `mapstructure:"logger"`
	WSConfig WSConfig     `mapstructure:"websocket"`
}

type AppConfig struct {
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
}

type RedisConfig struct {
	Host            string `mapstructure:"host"`
	Port            int    `mapstructure:"port"`
	Username        string `mapstructure:"username"`
	Password        string `mapstructure:"password"`
	DB              int    `mapstructure:"db"`
	MaxRetries      int    `mapstructure:"max_retries"`
	DialTimeout     int    `mapstructure:"dial_timeout"`
	MinRetryBackoff int    `mapstructure:"min_retry_backoff"`
	MaxRetryBackoff int    `mapstructure:"max_retry_backoff"`
}

type LoggerConfig struct {
	Level      string `mapstructure:"level"`
	FileName   string `mapstructure:"file_name"`
	MaxSize    int    `mapstructure:"max_size"`
	MaxBackups int    `mapstructure:"max_backups"`
	Compress   bool   `mapstructure:"compress"`
	MaxAge     int    `mapstructure:"max_age"`
}

type WSConfig struct {
	ReadBufferSize  int      `mapstructure:"read_buffer_size"`
	WriteBufferSize int      `mapstructure:"write_buffer_size"`
	WriteWait       int      `mapstructure:"write_wait"`
	PongWait        int      `mapstructure:"pong_wait"`
	MaxMessageSize  int      `mapstructure:"max_message_size"`
	Origins         []string `mapstructure:"origins"`
}
