package judge0

// SubmissionRequest is the body sent to POST /submissions.
type SubmissionRequest struct {
	LanguageID    int     `json:"language_id"`
	SourceCode    string  `json:"source_code"`
	Stdin         string  `json:"stdin"`
	CPUTimeLimit  float64 `json:"cpu_time_limit"`
	WallTimeLimit float64 `json:"wall_time_limit,omitempty"`
	MemoryLimit   int     `json:"memory_limit"` // KB
}

// SubmissionResponse is the response from Judge0 (with ?wait=true).
type SubmissionResponse struct {
	Token  string `json:"token"`
	Stdout string `json:"stdout"`
	Stderr string `json:"stderr"`
	// compile_output is set when the code fails to compile
	CompileOutput string `json:"compile_output"`
	// message is set for internal judge errors
	Message string `json:"message"`
	// status holds the verdict
	Status struct {
		ID          int    `json:"id"`
		Description string `json:"description"`
	} `json:"status"`
	Time   string `json:"time"`
	Memory int    `json:"memory"`
}

// Judge0 status IDs
// https://github.com/judge0/judge0/blob/master/docs/api/statuses-and-languages.md
const (
	StatusIDInQueue             = 1
	StatusIDProcessing          = 2
	StatusIDAccepted            = 3
	StatusIDWrongAnswer         = 4
	StatusIDTLE                 = 5
	StatusIDCompileError        = 6
	StatusIDRuntimeErrorSIGSEGV = 7
	StatusIDRuntimeErrorSIGXFSZ = 8
	StatusIDRuntimeErrorSIGFPE  = 9
	StatusIDRuntimeErrorSIGABRT = 10
	StatusIDRuntimeErrorNZEC    = 11
	StatusIDRuntimeErrorOther   = 12
	StatusIDInternalError       = 13
	StatusIDExecFormatError     = 14
)
