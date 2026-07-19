package logger

import (
	"os"
	"spatial-service/internal/config"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

type Logger struct {
	l       *zap.Logger
	sugared *zap.SugaredLogger
}

func levelFromConfig(level string) zapcore.Level {
	switch level {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	case "dpanic":
		return zapcore.DPanicLevel
	case "panic":
		return zapcore.PanicLevel
	case "fatal":
		return zapcore.FatalLevel
	default:
		return zapcore.InfoLevel
	}
}

func New(cfg *config.Config, lumberjackLogger *lumberjack.Logger) *Logger {
	var encoderConfig zapcore.EncoderConfig
	var stacktraceLevel zapcore.Level

	isDev := cfg.Env == "development"
	if isDev {
		encoderConfig = zap.NewDevelopmentEncoderConfig()
		stacktraceLevel = zapcore.WarnLevel
		encoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	} else {
		encoderConfig = zap.NewProductionEncoderConfig()
		encoderConfig.TimeKey = "timestamp"
		encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
		stacktraceLevel = zapcore.ErrorLevel
	}

	encoderConfig.EncodeCaller = zapcore.ShortCallerEncoder

	consoleWriter := zapcore.AddSync(os.Stdout)
	atomicLevel := zap.NewAtomicLevelAt(levelFromConfig(cfg.Logger.Level))

	var core zapcore.Core

	if isDev {
		core = zapcore.NewCore(zapcore.NewConsoleEncoder(encoderConfig), consoleWriter, atomicLevel)
	} else {
		fileWriter := zapcore.AddSync(lumberjackLogger)
		core = zapcore.NewTee(
			zapcore.NewCore(zapcore.NewJSONEncoder(encoderConfig), fileWriter, atomicLevel),
			zapcore.NewCore(zapcore.NewJSONEncoder(encoderConfig), consoleWriter, atomicLevel),
		)
	}

	options := []zap.Option{
		zap.AddCaller(),
		zap.AddCallerSkip(1),
		zap.AddStacktrace(stacktraceLevel),
	}

	logger := zap.New(core, options...)

	return &Logger{
		l:       logger,
		sugared: logger.Sugar(),
	}
}

func (l *Logger) Logger() *zap.Logger {
	return l.l
}

func (l *Logger) Sugared() *zap.SugaredLogger {
	return l.sugared
}

func (l *Logger) FatalS(msg string, fields ...zap.Field) {
	l.l.Fatal(msg, fields...)
}

func (l *Logger) Fatalf(tmpl string, args ...any) {
	l.sugared.Fatalf(tmpl, args...)
}

func (l *Logger) Fatal(args ...any) {
	l.sugared.Fatal(args...)
}

func (l *Logger) PanicS(tmpl string, args ...zap.Field) {
	l.l.Panic(tmpl, args...)
}

func (l *Logger) Panicf(tmpl string, args ...any) {
	l.sugared.Panicf(tmpl, args...)
}

func (l *Logger) Panic(args ...any) {
	l.sugared.Panic(args...)
}

func (l *Logger) DPanicS(tmpl string, args ...zap.Field) {
	l.l.DPanic(tmpl, args...)
}

func (l *Logger) DPanicf(tmpl string, args ...any) {
	l.sugared.DPanicf(tmpl, args...)
}

func (l *Logger) DPanic(args ...any) {
	l.sugared.DPanic(args...)
}

func (l *Logger) Errorf(tmpl string, args ...any) {
	l.sugared.Errorf(tmpl, args...)
}

func (l *Logger) ErrorS(tmpl string, args ...zap.Field) {
	l.l.Error(tmpl, args...)
}

func (l *Logger) Error(args ...any) {
	l.sugared.Error(args...)
}

func (l *Logger) WarnS(tmpl string, args ...zap.Field) {
	l.l.Warn(tmpl, args...)
}

func (l *Logger) Warnf(tmpl string, args ...any) {
	l.sugared.Warnf(tmpl, args...)
}

func (l *Logger) Warn(args ...any) {
	l.sugared.Warn(args...)
}

func (l *Logger) InfoS(tmpl string, args ...zap.Field) {
	l.l.Info(tmpl, args...)
}

func (l *Logger) Infof(tmpl string, args ...any) {
	l.sugared.Infof(tmpl, args...)
}

func (l *Logger) Info(args ...any) {
	l.sugared.Info(args...)
}

func (l *Logger) DebugS(tmpl string, args ...zap.Field) {
	l.l.Debug(tmpl, args...)
}

func (l *Logger) Debugf(tmpl string, args ...any) {
	l.sugared.Debugf(tmpl, args...)
}

func (l *Logger) Debug(args ...any) {
	l.sugared.Debug(args...)
}
