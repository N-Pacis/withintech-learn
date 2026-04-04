package models

// SupportedLanguage is a valid language identifier for challenge submissions.
type SupportedLanguage string

const (
	LangPython     SupportedLanguage = "python"
	LangJava       SupportedLanguage = "java"
	LangJavaScript SupportedLanguage = "javascript"
	LangC          SupportedLanguage = "c"
	LangCpp        SupportedLanguage = "cpp"
	LangGo         SupportedLanguage = "go"
)

// Judge0LanguageID maps our language names to Judge0 language IDs.
var Judge0LanguageID = map[SupportedLanguage]int{
	LangC:          50, // C (GCC 9.2.0)
	LangCpp:        54, // C++ (GCC 9.2.0)
	LangGo:         60, // Go (1.13.5)
	LangJava:       62, // Java (OpenJDK 13.0.1)
	LangJavaScript: 63, // JavaScript (Node.js 12.14.0)
	LangPython:     71, // Python (3.8.1)
}

// TestCase is a single input → expected output pair.
type TestCase struct {
	Input          string `json:"input"`
	ExpectedOutput string `json:"expectedOutput"`
}

// ExecuteRequest is the payload sent to POST /execute.
type ExecuteRequest struct {
	Language        SupportedLanguage `json:"language"`
	Code            string            `json:"code"`
	TestCases       []TestCase        `json:"testCases"`
	TimeLimit       int               `json:"timeLimit"` // seconds, default 5
	BatchedInput    string            `json:"batchedInput,omitempty"`
	ExpectedOutputs []string          `json:"expectedOutputs,omitempty"`
}

// TestCaseResult is the per-test-case result returned to the caller.
type TestCaseResult struct {
	Passed         bool   `json:"passed"`
	Input          string `json:"input"`
	ActualOutput   string `json:"actualOutput"`
	ExpectedOutput string `json:"expectedOutput"`
	Stderr         string `json:"stderr"`
}

// ExecutionStatus represents the overall verdict.
type ExecutionStatus string

const (
	StatusAccepted          ExecutionStatus = "accepted"
	StatusWrongAnswer       ExecutionStatus = "wrong_answer"
	StatusTimeLimitExceeded ExecutionStatus = "time_limit_exceeded"
	StatusRuntimeError      ExecutionStatus = "runtime_error"
	StatusCompileError      ExecutionStatus = "compile_error"
)

// ExecuteResponse is the payload returned from POST /execute.
type ExecuteResponse struct {
	Status       ExecutionStatus  `json:"status"`
	TestsPassed  int              `json:"testsPassed"`
	TotalTests   int              `json:"totalTests"`
	Results      []TestCaseResult `json:"results"`
	CompileError string           `json:"compileError,omitempty"`
}
