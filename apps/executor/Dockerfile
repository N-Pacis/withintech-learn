FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o executor .

FROM scratch
COPY --from=builder /app/executor /executor
EXPOSE 4001
ENTRYPOINT ["/executor"]
