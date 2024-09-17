package main

import (
	"context"
	"fmt"
	"github.com/riverqueue/river"
	"time"
)

type DummyArgs struct {
	// Strings is a slice of strings to sort.
	Latency int `json:"latency"`
}

func (DummyArgs) Kind() string { return "sort" }

type DummyWorker struct {
	// An embedded WorkerDefaults sets up default methods to fulfill the rest of
	// the Worker interface:
	river.WorkerDefaults[DummyArgs]
}

func (w *DummyWorker) Work(ctx context.Context, job *river.Job[DummyArgs]) error {
	// Optionally log job start
	select {
	case <-time.After(time.Duration(job.Args.Latency) * time.Millisecond):
		fmt.Printf("Job %+v completed", job.ID)
	}
	// Optionally log job completion
	return nil
}
