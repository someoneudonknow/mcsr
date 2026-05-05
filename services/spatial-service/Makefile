.PHONY: run build clean

NAME=spatial-service
BIN_PATH=./bin
CMD_PATH=./cmd/server/main.go

run:
	go run $(CMD_PATH)

build:
	mkdir -p $(BIN_PATH)
	go build -o $(BIN_PATH)/$(NAME) $(CMD_PATH)

clean:
	rm -rf $(BIN_PATH)/$(NAME)

rebuild: clean build