#!/bin/bash

OS=$(uname -s)
echo "Detected OS: $OS"

is_go_installed() {
    if command -v go >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

is_air_installed() {
    if command -v air >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

is_atlas_installed() {
    if command -v atlas >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

install_atlas() {
    if command -v atlas >/dev/null 2>&1; then
        echo "Atlas is already installed."
    else
        echo "Installing Atlas..."
        curl -sSf https://atlasgo.sh | sh
    fi
}

init_atlas() {
    if is_atlas_installed; then
        echo "Initializing Atlas..."
        if [ -f "atlas.hcl" ]; then
            echo "Atlas is already initialized."
        else
            echo "Initializing Atlas..."
            touch atlas.hcl
            cat <<EOF > atlas.hcl
data "external_schema" "gorm" {
  program = [
    "go", "run", "ariga.io/atlas-provider-gorm", "load",
    "--path", "./internal/models",
    "--dialect", "postgres",
  ]
}

env "gorm" {
  src = data.external_schema.gorm.url
  dev = "docker://postgres/18/dev"
  migration {
    dir = "file://internal/migrations?format=golang-migrate"
  }
}
EOF
        fi
    else
        echo "Atlas is not installed. Skipping initialization."
        return 1
    fi
}

install_air() {
    if command -v air >/dev/null 2>&1; then
        echo "Air is already installed."
    else
        if is_go_installed; then
            echo "Installing Air..."
            go install github.com/air-verse/air@latest
        else
            echo "Go is not installed. Please install Go first."
            exit 1
        fi
    fi
}

init_air() {
    if is_air_installed; then
        if [ ! -f ".air.toml" ]; then
            echo "Initializing Air..."
            air init

            if [ -f "./cmd/api/main.go"]; then
                echo "Auto-configuring .air.toml for ./cmd/api..."

                sed -i.bak 's|cmd = "go build -o ./tmp/main ."|cmd = "go build -o ./tmp/main ./cmd/api"|g' .air.toml

                rm -f .air.toml.bak

                echo "Air is now configured for ./cmd/api."
            else
                echo ".air.toml already exists. Skipping configuration."
            fi
        else
            echo ".air.toml already exists. Skipping initialization."
        fi
    else
        echo "Air is not installed. Skipping initialization."
        return 1
    fi
}

main() {
    install_atlas
    init_atlas
    install_air
    init_air
}

main
