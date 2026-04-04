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
// The underlying transport is tuned for high-concurrency: up to 50 idle connections,
// 30 s idle timeout, and disabled compression (Judge0 responses are small JSON).
func NewClient(baseURL string) *Client {
	transport := &http.Transport{
		MaxIdleConns:        50,
		MaxIdleConnsPerHost: 50,
		IdleConnTimeout:     30 * time.Second,
		DisableCompression:  true,
	}
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		httpClient: &http.Client{
			Transport: transport,
			Timeout:   10 * time.Minute, // batch mode can compile once and run many cases in one submission
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
