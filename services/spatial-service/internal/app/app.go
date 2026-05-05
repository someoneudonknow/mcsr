package app

import (
	"fmt"
	"os"
	"path"
	"spatial-service/internal/constants"
	"spatial-service/internal/handlers/http"
	"spatial-service/internal/middlewares"
	"spatial-service/internal/repo"
	"spatial-service/internal/services"
	"spatial-service/internal/transports/ws"
	"spatial-service/pkg/config"
	"spatial-service/pkg/logger"
	"spatial-service/pkg/redis"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type App struct {
	Config *config.Config
	Logger *logger.Logger
	Redis  *redis.RedisClient
}

func NewApp() *App {
	return &App{}
}

func (app *App) Run() error {
	if err := app.initConfig(); err != nil {
		return err
	}

	app.initLogger()

	if err := app.initRedis(); err != nil {
		return err
	}

	return app.initRouters()
}

func (app *App) initRouters() error {
	router := gin.Default()

	router.Use(gin.Recovery())
	router.Use(cors.Default())
	router.Use(middlewares.AttachLogger(app.Logger))

	// Ws Hub
	hub := ws.NewHub()
	go hub.Run()

	// Repo
	locationRepo := repo.NewLocationRepo(app.Redis)

	// Services
	locationService := services.NewLocationService(locationRepo)

	// Handlers
	locationHandler := http.NewLocationHandler(locationService)
	wsHanlder := ws.NewWsHandler(app.Config.WSConfig, hub)

	// HTTPs Routers
	v1Group := router.Group("/v1")
	locationHandler.Routes(v1Group)

	// Websocket handler
	wsGroup := router.Group("/ws")
	wsHanlder.Routes(wsGroup)

	hub.On(constants.WS_EVENT_LOCATION_UPDATE, func(c *ws.WsClient, message []byte) {
		app.Logger.Infof("Location update event received with message: %s", string(message))
		// locationHandler.HandleLocationUpdate(c, message)
	})

	addr := fmt.Sprintf("%s:%d", app.Config.App.Host, app.Config.App.Port)
	app.Logger.Infof("starting server at %s", addr)

	return router.Run(addr)
}

func (app *App) initLogger() {
	zLogger := logger.NewLogger(app.Config.Logger)
	zap.ReplaceGlobals(zLogger.Logger())
	app.Logger = zLogger
}

func (app *App) initRedis() error {
	redisClient, err := redis.NewClient(app.Config.Redis)
	if err != nil {
		return err
	}
	app.Redis = redisClient
	return nil
}

func (app *App) initConfig() error {
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "dev"
	}

	config, err := config.Load(path.Join("config", env))
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	app.Config = config
	return nil
}

func (app *App) Close() {
	if app.Redis != nil {
		app.Redis.Client.Close()
	}

	if app.Logger != nil {
		app.Logger.Sync()
	}
}
