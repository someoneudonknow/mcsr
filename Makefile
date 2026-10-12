.PHONY: up down logs db-init build

help:
	@echo "Available commands:"
	@echo "  make up      - Start all infrastructure (Postgres, APISIX, etc.)"
	@echo "  make down    - Stop all infrastructure"
	@echo "  make logs    - View logs of all containers"
	@echo "  make build   - Build docker images for services"
	@echo "  make init-kafka-topic  - Create Kafka topics"

up:
	docker compose -f infra/docker-compose.yml up -d

down:
	docker compose -f infra/docker-compose.yml down

clean:
	docker compose -f infra/docker-compose.yml down -v

logs:
	docker compose -f infra/docker-compose.yml logs -f

build:
	docker build -t mcsr-auth-service ./services/auth-service

init-kafka-topic:
	./infra/scripts/create-kafka-topic.sh
