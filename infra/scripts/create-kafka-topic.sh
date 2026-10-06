!/bin/bash

set -euo pipefail

TOPICS=(
    auth.owner_email_verified.v1
    organization.activated.v1
    organization.suspended.v1
)

for topic in "${TOPICS[@]}"; do
    echo "Creating topic $topic"
  docker exec -it mcs
done
