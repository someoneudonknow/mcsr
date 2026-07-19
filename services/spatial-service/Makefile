.PHONY: run tidy build

image-name=geomessage/spatial-service:latest
container-name=geomessage-spatial-service
dockerfile-path=.
app-port=8080

run:
	go run ./cmd/api/main.go

tidy:
	go mod tidy

docker-build:
	docker build -t $(image-name) $(dockerfile-path)

docker-run:
	docker run -d -p $(app-port):$(app-port) $(image-name) --rm --name $(container-name) 

docker-restart:
	docker restart $(container-name)
