package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/withintech-learn/executor/judge0"
	"github.com/withintech-learn/executor/models"
)

// ExecuteHandler handles POST /execute.
type ExecuteHandler struct {
	judge0  *judge0.Client
	secret  string
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

	// Default time limit
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

func runTestCases(
	client *judge0.Client,
	code string,
	langID int,
	testCases []models.TestCase,
	timeLimit int,
) models.ExecuteResponse {
	results := make([]models.TestCaseResult, 0, len(testCases))
	passed := 0

	for _, tc := range testCases {
		subReq := judge0.SubmissionRequest{
			LanguageID:   langID,
			SourceCode:   code,
			Stdin:        tc.Input,
			CPUTimeLimit: float64(timeLimit),
			MemoryLimit:  262144, // 256 MB
		}

		sub, err := client.Submit(subReq)
		if err != nil {
			// Judge0 unreachable — fail gracefully
			results = append(results, models.TestCaseResult{
				Passed:         false,
				Input:          tc.Input,
				ActualOutput:   "",
				ExpectedOutput: tc.ExpectedOutput,
				Stderr:         fmt.Sprintf("execution engine error: %v", err),
			})
			continue
		}

		// Compile error — stop all remaining test cases
		if sub.Status.ID == judge0.StatusIDCompileError {
			compileMsg := strings.TrimSpace(sub.CompileOutput)
			// Pad remaining test cases as failed
			for i := len(results); i < len(testCases); i++ {
				results = append(results, models.TestCaseResult{
					Passed:         false,
					Input:          testCases[i].Input,
					ActualOutput:   "",
					ExpectedOutput: testCases[i].ExpectedOutput,
					Stderr:         "compile error",
				})
			}
			return models.ExecuteResponse{
				Status:       models.StatusCompileError,
				TestsPassed:  0,
				TotalTests:   len(testCases),
				Results:      results,
				CompileError: compileMsg,
			}
		}

		actual := strings.TrimRight(sub.Stdout, "\n")
		expected := strings.TrimRight(tc.ExpectedOutput, "\n")
		testPassed := actual == expected

		if testPassed {
			passed++
		}

		tcResult := models.TestCaseResult{
			Passed:         testPassed,
			Input:          tc.Input,
			ActualOutput:   actual,
			ExpectedOutput: expected,
			Stderr:         strings.TrimSpace(sub.Stderr),
		}

		// Override actual output display for non-accepted verdicts
		if sub.Status.ID == judge0.StatusIDTLE {
			tcResult.ActualOutput = "Time Limit Exceeded"
		} else if sub.Status.ID >= judge0.StatusIDRuntimeErrorSIGSEGV {
			tcResult.ActualOutput = "Runtime Error"
		}

		results = append(results, tcResult)
	}

	// Determine overall status
	status := overallStatus(results)

	return models.ExecuteResponse{
		Status:      status,
		TestsPassed: passed,
		TotalTests:  len(testCases),
		Results:     results,
	}
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
