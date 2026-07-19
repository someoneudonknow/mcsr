FROM golang:1.26-alpine AS builder-stage

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /spatial-service ./cmd/api/main.go

FROM gcr.io/distroless/base-debian11 AS release-stage

WORKDIR /app

COPY --from=builder-stage /spatial-service /app/spatial-service
COPY --from=builder-stage /app/config ./config

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/app/spatial-service"]
