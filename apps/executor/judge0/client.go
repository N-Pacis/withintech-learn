package judge0

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Client is a thin HTTP client for the Judge0 REST API.
type Client struct {
	baseURL    string
	httpClient *http.Client
}

// NewClient creates a Judge0 client pointing at baseURL (e.g. "http://localhost:2358").
func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// Submit sends one submission to Judge0 and waits for the result synchronously.
// It uses ?wait=true so no polling is needed.
func (c *Client) Submit(req SubmissionRequest) (*SubmissionResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal: %w", err)
	}

	url := c.baseURL + "/submissions?wait=true&base64_encoded=false"
	httpReq, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("new request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("http: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("judge0 error %d: %s", resp.StatusCode, string(raw))
	}

	var result SubmissionResponse
	if err := json.Unmarshal(raw, &result); err != nil {
		return nil, fmt.Errorf("unmarshal: %w", err)
	}

	return &result, nil
}
