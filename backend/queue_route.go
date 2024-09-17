package main

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/riverqueue/river"
	"net/http"
	"time"
)

type DummyJobRequest struct {
	Latency int `json:"latency"`
}

func InsertToQueue(r *river.Client[pgx.Tx], db *pgxpool.Pool, c echo.Context) error {
	ctx := context.Background()

	// Start a transaction
	tx, err := db.Begin(ctx)
	if err != nil {
		return err
	}

	// marshal request body into a struct
	jobReq := &DummyJobRequest{}
	if err := c.Bind(jobReq); err != nil {
		return c.JSON(http.StatusBadRequest, "Invalid request")
	}

	latency := jobReq.Latency
	_, err = r.InsertTx(ctx, tx, DummyArgs{Latency: latency}, nil)
	if err != nil {
		_ = tx.Rollback(ctx) // Rollback transaction in case of an error
		return c.JSON(http.StatusInternalServerError, "Failed to insert job")
	}
	// If everything went fine, commit the transaction
	if err := tx.Commit(ctx); err != nil {
		return c.JSON(http.StatusInternalServerError, "Failed to commit transaction")
	}
	return c.JSON(http.StatusOK, "Job inserted successfully")
}

func SendCompletedQueueEvents(completedChan <-chan *river.Event, c echo.Context) error {
	c.Response().Header().Set(echo.HeaderContentType, "text/event-stream")
	c.Response().Header().Set(echo.HeaderCacheControl, "no-cache")
	c.Response().Header().Set("Connection", "keep-alive")
	c.Response().WriteHeader(http.StatusOK)

	// signal the server that a new client has connected
	_, err := fmt.Println("connected")
	if err != nil {
		return err
	}

	keepAliveTickler := time.NewTicker(1 * time.Second)
	keepAliveMsg := " :keep-alive\n\n"
	defer keepAliveTickler.Stop()

	for {
		select {
		case <-keepAliveTickler.C:
			_, err := fmt.Fprintf(c.Response(), keepAliveMsg)
			if err != nil {
				fmt.Printf("Client disconnected or error writing to response: %v\n", err)
				return err // or break the loop if you prefer to continue
			}
			c.Response().Flush()

		case e := <-completedChan:
			_, err := fmt.Fprintf(c.Response(), "data: %s\n\n", "job_completed")
			if err != nil {
				fmt.Printf("Client disconnected or error writing to response: %v\n", err)
				return err // or break the loop if you prefer to continue
			}
			c.Response().Flush()

			fmt.Printf("\nJob %v Sent \n", e.Job.ID)
		case <-c.Request().Context().Done():
			// The context is cancelled when the client connection is closed
			fmt.Println("Client connection closed")
			return nil
		}
	}
}
