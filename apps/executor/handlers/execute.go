package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"

	"github.com/withintech-learn/executor/judge0"
	"github.com/withintech-learn/executor/models"
)

// maxConcurrent caps the number of in-flight Judge0 requests at once.
// Set to 1 to match the single Judge0 worker — queuing more just adds overhead.
const maxConcurrent = 1

// ExecuteHandler handles POST /execute.
type ExecuteHandler struct {
	judge0 *judge0.Client
	secret string
}

// NewExecuteHandler creates a handler backed by the given Judge0 client.
// secret is the shared EXECUTOR_SECRET; an empty string disables auth (dev only).
func NewExecuteHandler(client *judge0.Client, secret string) *ExecuteHandler {
	return &ExecuteHandler{judge0: client, secret: secret}
}

func (h *ExecuteHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	// Shared-secret auth — reject requests that don't carry the correct bearer token.
	if h.secret != "" {
		auth := r.Header.Get("Authorization")
		if auth != "Bearer "+h.secret {
			writeError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
	}

	var req models.ExecuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	if err := validateRequest(req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if req.TimeLimit <= 0 || req.TimeLimit > 15 {
		req.TimeLimit = 5
	}

	langID := models.Judge0LanguageID[req.Language]
	resp := runTestCases(h.judge0, req.Code, langID, req.TestCases, req.TimeLimit)
	writeJSON(w, http.StatusOK, resp)
}

func validateRequest(req models.ExecuteRequest) error {
	_, ok := models.Judge0LanguageID[req.Language]
	if !ok {
		return fmt.Errorf("unsupported language: %s", req.Language)
	}
	if strings.TrimSpace(req.Code) == "" {
		return fmt.Errorf("code is required")
	}
	if len(req.TestCases) == 0 {
		return fmt.Errorf("at least one test case is required")
	}
	if len(req.TestCases) > 100 {
		return fmt.Errorf("maximum 100 test cases per submission")
	}
	return nil
}

// tcOutcome carries the result for one test case back from its goroutine.
type tcOutcome struct {
	index        int
	result       models.TestCaseResult
	compileError string // non-empty means this submission failed to compile
}

// runTestCases submits all test cases to Judge0 concurrently and aggregates results.
func runTestCases(
	client *judge0.Client,
	code string,
	langID int,
	testCases []models.TestCase,
	timeLimit int,
) models.ExecuteResponse {
	n := len(testCases)
	results := make([]models.TestCaseResult, n)

	// sem limits concurrent in-flight HTTP requests to Judge0.
	sem := make(chan struct{}, maxConcurrent)
	out := make(chan tcOutcome, n)

	var wg sync.WaitGroup
	for i, tc := range testCases {
		wg.Add(1)
		go func(i int, tc models.TestCase) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			out <- submitOne(client, code, langID, i, tc, timeLimit)
		}(i, tc)
	}

	// Close the channel once all goroutines are done.
	go func() {
		wg.Wait()
		close(out)
	}()

	// Collect results preserving original order.
	compileErr := ""
	for o := range out {
		results[o.index] = o.result
		if o.compileError != "" && compileErr == "" {
			compileErr = o.compileError
		}
	}

	if compileErr != "" {
		return models.ExecuteResponse{
			Status:       models.StatusCompileError,
			TestsPassed:  0,
			TotalTests:   n,
			Results:      results,
			CompileError: compileErr,
		}
	}

	passed := 0
	for _, r := range results {
		if r.Passed {
			passed++
		}
	}

	return models.ExecuteResponse{
		Status:      overallStatus(results),
		TestsPassed: passed,
		TotalTests:  n,
		Results:     results,
	}
}

// submitOne runs a single test case against Judge0 and returns its outcome.
func submitOne(
	client *judge0.Client,
	code string,
	langID int,
	index int,
	tc models.TestCase,
	timeLimit int,
) tcOutcome {
	subReq := judge0.SubmissionRequest{
		LanguageID:   langID,
		SourceCode:   code,
		Stdin:        tc.Input,
		CPUTimeLimit: float64(timeLimit),
		MemoryLimit:  262144, // 256 MB
	}

	sub, err := client.Submit(subReq)
	if err != nil {
		return tcOutcome{index: index, result: models.TestCaseResult{
			Passed:         false,
			Input:          tc.Input,
			ActualOutput:   "",
			ExpectedOutput: tc.ExpectedOutput,
			Stderr:         fmt.Sprintf("execution engine error: %v", err),
		}}
	}

	if sub.Status.ID == judge0.StatusIDCompileError {
		return tcOutcome{
			index:        index,
			compileError: strings.TrimSpace(sub.CompileOutput),
			result: models.TestCaseResult{
				Passed:         false,
				Input:          tc.Input,
				ActualOutput:   "",
				ExpectedOutput: tc.ExpectedOutput,
				Stderr:         "compile error",
			},
		}
	}

	actual := strings.TrimRight(sub.Stdout, "\n")
	expected := strings.TrimRight(tc.ExpectedOutput, "\n")

	r := models.TestCaseResult{
		Passed:         actual == expected,
		Input:          tc.Input,
		ActualOutput:   actual,
		ExpectedOutput: expected,
		Stderr:         strings.TrimSpace(sub.Stderr),
	}
	if sub.Status.ID == judge0.StatusIDTLE {
		r.ActualOutput = "Time Limit Exceeded"
	} else if sub.Status.ID >= judge0.StatusIDRuntimeErrorSIGSEGV {
		r.ActualOutput = "Runtime Error"
	}

	return tcOutcome{index: index, result: r}
}

func overallStatus(results []models.TestCaseResult) models.ExecutionStatus {
	for _, r := range results {
		if r.ActualOutput == "Time Limit Exceeded" {
			return models.StatusTimeLimitExceeded
		}
		if r.ActualOutput == "Runtime Error" {
			return models.StatusRuntimeError
		}
	}
	for _, r := range results {
		if !r.Passed {
			return models.StatusWrongAnswer
		}
	}
	return models.StatusAccepted
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
