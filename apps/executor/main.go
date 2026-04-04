package main

import (
	"log"
	"net/http"
	"os"
	"runtime"

	"github.com/withintech-learn/executor/handlers"
	"github.com/withintech-learn/executor/judge0"
)

func main() {
	// Single OS thread — executor is sequential I/O (1 Judge0 worker).
	if maxProcs := getEnv("GOMAXPROCS", ""); maxProcs == "" {
		runtime.GOMAXPROCS(1)
	}

	judge0URL := getEnv("JUDGE0_URL", "http://localhost:2358")
	port := getEnv("PORT", "4001")

	secret := getEnv("EXECUTOR_SECRET", "")
	judge0Client := judge0.NewClient(judge0URL)
	executeHandler := handlers.NewExecuteHandler(judge0Client, secret)

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	mux.Handle("/execute", executeHandler)

	addr := ":" + port
	log.Printf("[executor] listening on %s — judge0 at %s", addr, judge0URL)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("[executor] fatal: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
