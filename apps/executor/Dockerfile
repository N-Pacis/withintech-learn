FROM golang:1.23-alpine AS builder
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o executor .

FROM scratch
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group
COPY --from=builder /app/executor /executor
USER app
EXPOSE 4001
ENTRYPOINT ["/executor"]
