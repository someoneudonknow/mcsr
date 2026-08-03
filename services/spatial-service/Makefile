.PHONY: init run tidy docker-build docker-run docker-restart migrate-gen migrate-lint migrate-apply

IMAGE_NAME=mcsr/spatial-service:latest
CONTAINER_NAME=mcsr-spatial-service
DOCKERFILE_PATH=.
APP_PORT=8080

init:
ifeq ($(OS),Windows_NT)
	@echo "Detected OS: Windows"
	@echo "Detected Windows. Launching PowerShell script..."
	@powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1
else
	@echo "Detected Unix-like OS. Launching shell script..."
	@chmod +x ./scripts/devtools/install.sh
	@./scripts/devtools/install.sh
endif

run-dev:
	air

migrate-gen:
	atlas migrate diff $(name) --env gorm

migrate-lint:
	atlas migrate lint --env gorm --latest 1

migrate-apply:
	atlas migrate apply --env gorm

tidy:
	go mod tidy

docker-build:
	docker build -t $(IMAGE_NAME) $(DOCKERFILE_PATH)

docker-run:
	docker run -d -p $(APP_PORT):$(APP_PORT) $(IMAGE_NAME) --rm --name $(CONTAINER_NAME) 

docker-restart:
	docker restart $(CONTAINER_NAME)
