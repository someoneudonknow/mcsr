package logger

import (
	"context"
	"os"
	"spatial-service/pkg/config"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

type Logger struct {
	logger        *zap.Logger
	sugaredLogger *zap.SugaredLogger
}

type loggerKey string

const (
	ctxKey loggerKey = "logger"
)

func (l *Logger) Logger(args ...interface{}) *zap.Logger {
	return l.logger
}

func (l *Logger) SugaredLogger(args ...interface{}) *zap.SugaredLogger {
	return l.sugaredLogger
}

func (l *Logger) Sync() {
	l.logger.Sync()
	l.sugaredLogger.Sync()
}

func (l *Logger) Fatalf(tmpl string, args ...interface{}) {
	l.sugaredLogger.Fatalf(tmpl, args)
}

func (l *Logger) Fatal(args ...interface{}) {
	l.sugaredLogger.Fatal(args)
}

func (l *Logger) Panicf(tmpl string, args ...interface{}) {
	l.sugaredLogger.Panicf(tmpl, args)
}

func (l *Logger) Panic(args ...interface{}) {
	l.sugaredLogger.Panic(args)
}

func (l *Logger) DPanicf(tmpl string, args ...interface{}) {
	l.sugaredLogger.DPanicf(tmpl, args)
}

func (l *Logger) DPanic(args ...interface{}) {
	l.sugaredLogger.DPanic(args)
}

func (l *Logger) Errorf(tmpl string, args ...interface{}) {
	l.sugaredLogger.Errorf(tmpl, args)
}

func (l *Logger) Error(args ...interface{}) {
	l.sugaredLogger.Error(args)
}

func (l *Logger) Warnf(tmpl string, args ...interface{}) {
	l.sugaredLogger.Warnf(tmpl, args)
}

func (l *Logger) Warn(args ...interface{}) {
	l.sugaredLogger.Warn(args)
}

func (l *Logger) Infof(tmpl string, args ...interface{}) {
	l.sugaredLogger.Infof(tmpl, args)
}

func (l *Logger) Info(args ...interface{}) {
	l.sugaredLogger.Info(args)
}

func (l *Logger) Debugf(tmpl string, args ...interface{}) {
	l.sugaredLogger.Debugf(tmpl, args)
}

func (l *Logger) Debug(args ...interface{}) {
	l.sugaredLogger.Debug(args)
}

func (l *Logger) WithName(name string) *Logger {
	newLogger := l.logger.Named(name)
	return &Logger{logger: newLogger, sugaredLogger: newLogger.Sugar()}
}

func levelFromConfig(level string) zapcore.Level {
	switch level {
	case "debug":
		return zap.DebugLevel
	case "info":
		return zap.InfoLevel
	case "warn":
		return zap.WarnLevel
	case "error":
		return zap.ErrorLevel
	case "dpanic":
		return zap.DebugLevel
	case "panic":
		return zap.PanicLevel
	case "fatal":
		return zap.FatalLevel
	default:
		return zap.InfoLevel
	}
}

func lummerjackHookFromConfig(cfg config.LoggerConfig) *lumberjack.Logger {
	return &lumberjack.Logger{
		Filename:   cfg.FileName,
		MaxSize:    cfg.MaxSize,
		MaxBackups: cfg.MaxBackups,
		MaxAge:     cfg.MaxAge,
		Compress:   cfg.Compress,
	}
}

func NewLogger(cfg config.LoggerConfig) *Logger {
	encoderCfg := zap.NewProductionEncoderConfig()

	encoderCfg.TimeKey = "timestamp"

	encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderCfg.EncodeLevel = zapcore.CapitalLevelEncoder
	encoderCfg.EncodeCaller = zapcore.ShortCallerEncoder

	fileWriter := zapcore.AddSync(lummerjackHookFromConfig(cfg))
	consoleWriter := zapcore.AddSync(os.Stdout)

	consoleEncoderConfig := encoderCfg
	consoleEncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder

	atomicLevel := zap.NewAtomicLevelAt(levelFromConfig(cfg.Level))

	core := zapcore.NewTee(
		zapcore.NewCore(zapcore.NewJSONEncoder(encoderCfg), fileWriter, atomicLevel),
		zapcore.NewCore(zapcore.NewConsoleEncoder(encoderCfg), consoleWriter, atomicLevel),
	)
	options := []zap.Option{zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel)}

	logger := zap.New(core, options...)

	return &Logger{logger: logger, sugaredLogger: logger.Sugar()}
}

func FromContext(ctx context.Context) *Logger {
	if l, ok := ctx.Value(ctxKey).(*Logger); ok {
		return l
	}
	nop := zap.NewNop()
	return &Logger{logger: nop, sugaredLogger: nop.Sugar()}
}

func ToContext(ctx context.Context, l *Logger) context.Context {
	return context.WithValue(ctx, ctxKey, l)
}
