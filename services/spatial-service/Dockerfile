FROM golang:1.26.2-alpine3.23 as builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
  go build -ldflags="-s -w" -o spatial-service

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /app/spatial-service .

ENV PORT 3002

EXPOSE $PORT

CMD ["./geomessage-spatial-service"]
