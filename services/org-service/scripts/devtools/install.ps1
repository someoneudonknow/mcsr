#!/usr/bin/env pwsh

$OS = $PSVersionTable.OS
Write-Host "Detected OS: $OS"

function Test-GoInstalled {
    return [bool](Get-Command "go" -ErrorAction SilentlyContinue)
}

function Test-AirInstalled {
    return [bool](Get-Command "air" -ErrorAction SilentlyContinue)
}

function Test-AtlasInstalled {
    return [bool](Get-Command "atlas" -ErrorAction SilentlyContinue)
}

function Install-Atlas {
    if (Test-AtlasInstalled) {
        Write-Host "Atlas is already installed."
    } else {
        Write-Host "Installing Atlas..."
        $atlasUrl = "https://release.ariga.io/atlas/atlas-windows-amd64-latest.exe"
        
        if (Test-GoInstalled) {
            $goPath = go env GOPATH
            $installDir = Join-Path $goPath "bin"
            if (-not (Test-Path $installDir)) {
                New-Item -ItemType Directory -Path $installDir | Out-Null
            }
            $dest = Join-Path $installDir "atlas.exe"
        } else {
            $dest = ".\atlas.exe" 
        }

        Invoke-WebRequest -Uri $atlasUrl -OutFile $dest
        Write-Host "Atlas installed to $dest"
    }
}

function Init-Atlas {
    if ((Test-AtlasInstalled) -or (Test-Path ".\atlas.exe")) {
        if (Test-Path "atlas.hcl") {
            Write-Host "Atlas is already initialized."
        } else {
            Write-Host "Initializing Atlas..."
            
            $atlasConfig = @"
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
"@
            Set-Content -Path "atlas.hcl" -Value $atlasConfig
        }
    } else {
        Write-Host "Atlas is not installed. Skipping initialization."
    }
}

function Install-Air {
    if (Test-AirInstalled) {
        Write-Host "Air is already installed."
    } else {
        if (Test-GoInstalled) {
            Write-Host "Installing Air..."
            go install github.com/air-verse/air@latest
        } else {
            Write-Host "Go is not installed. Please install Go first."
            exit 1
        }
    }
}

function Init-Air {
    if (Test-AirInstalled) {
        if (-not (Test-Path ".air.toml")) {
            Write-Host "Initializing Air..."
            air init

            if (Test-Path ".\cmd\api\main.go") {
                Write-Host "Auto-configuring .air.toml for ./cmd/api..."
                
                $airConfig = Get-Content ".air.toml" -Raw
                $airConfig = $airConfig.Replace(
                    'cmd = "go build -o ./tmp/main ."', 
                    'cmd = "go build -o ./tmp/main ./cmd/api"'
                )
                Set-Content -Path ".air.toml" -Value $airConfig

                Write-Host "Air is now configured for ./cmd/api."
            } else {
                Write-Host "cmd/api/main.go not found. Skipping auto-configuration."
            }
        } else {
            Write-Host ".air.toml already exists. Skipping initialization."
        }
    } else {
        Write-Host "Air is not installed. Skipping initialization."
    }
}

function Main {
    Install-Atlas
    Init-Atlas
    Install-Air
    Init-Air
}

Main