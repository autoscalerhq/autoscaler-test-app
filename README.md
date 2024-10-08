# Autoscale Test App

Objective: Produce live data for autoscaler testing. 

## Prerequisites
This app uses River Queue to create a simple queue service that processes jobs.
It simulates a queue that has jobs with specified processing times. 

River Queue uses Postgres as its backend and needs a few tables to function properly.
From the project root, run the following commands to create the necessary tables:

```bash
cd backend
go install github.com/riverqueue/river/cmd/river@latest
river migrate-up --database-url "$DATABASE_URL"
```
or if you already have the river cli
```bash
river migrate-up --database-url "$DATABASE_URL"
```
Finally in the backend/main.go file, you need to replace the pgxpool connection string with your own. 

## Getting Started

Start the frontend web app:
```bash
cd app
pnpm install 
pnpm dev
```

Start the backend server:
```bash
cd backend
go run .
```

## Local Stacks Setup
coming soon