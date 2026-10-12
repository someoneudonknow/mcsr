#!/usr/bin/env bash

set -euo pipefail

TOPICS=(
    auth.owner_email_verified.v1
    organization.activated.v1
    organization.suspended.v1
)

for topic in "${TOPICS[@]}"; do
  echo "Creating topic $topic"
  docker exec mcsr_kafka_1 /opt/kafka/bin/kafka-topics.sh \
    --bootstrap-server kafka-1:9092 \
    --create --if-not-exists \
    --topic "$topic" \
    --partitions 3 \
    --replication-factor 3
done
