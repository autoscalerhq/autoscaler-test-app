package main

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverpgxv5"
	"github.com/riverqueue/river/rivershared/util/slogutil"
	"log/slog"
	"os"
	"time"
)

// river needs a couple of tables to work
// river migrate-up --database-url "postgresql://postgres:admin@localhost:5432/postgres"
func main() {
	e := echo.New()
	ctx := context.Background()
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgresql://postgres:admin@localhost:5432/postgres"
	}
	dbPool, err := pgxpool.New(ctx, dbUrl)
	if err != nil {
		e.Logger.Fatal(err)
	}

	workers := river.NewWorkers()
	if err := river.AddWorkerSafely(workers, &DummyWorker{}); err != nil {
		panic("failed to add worker")
	}
	riverClient, err := river.NewClient(riverpgxv5.New(dbPool), &river.Config{
		Logger: slog.New(&slogutil.SlogMessageOnlyHandler{Level: slog.LevelWarn}),
		Queues: map[string]river.QueueConfig{
			river.QueueDefault: {
				MaxWorkers: 100,
			},
		},
		JobTimeout:        30 * time.Second,
		FetchPollInterval: 100 * time.Millisecond,
		Workers:           workers,
	})

	defer func(riverClient *river.Client[pgx.Tx], ctx context.Context) {
		err := riverClient.Stop(ctx)
		if err != nil {
			e.Logger.Fatal(err)
		}
	}(riverClient, ctx)
	if err != nil {
		e.Logger.Fatal(err)
	}

	if err := riverClient.Start(ctx); err != nil {
		e.Logger.Fatal(err)
	}

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		//		AllowOrigins: []string{"http://localhost:3001"}, // specify allowed origin(s)
		AllowOrigins: []string{"*"}, // specify allowed origin(s)
		AllowMethods: []string{echo.GET, echo.POST},
	}))

	e.POST("/request", func(c echo.Context) error {
		fmt.Printf("Request received: %v", c.Request())
		return c.String(200, "Hello, World!")
	})

	e.POST("/insertToQueue", func(c echo.Context) error {
		return InsertToQueue(riverClient, dbPool, c)
	})

	completedChan, completedSubscribeCancel := riverClient.Subscribe(river.EventKindJobCompleted)
	defer completedSubscribeCancel()

	e.GET("/queueCompletedEvents", func(c echo.Context) error {
		return SendCompletedQueueEvents(completedChan, c)
	})

	e.Logger.Fatal(e.Start(":8080"))
}
