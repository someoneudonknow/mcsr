Write-Host "--- Checking tools ---"

if (Get-Command atlas -ErrorAction SilentlyContinue) {
    Write-Host "Atlas is already installed. Skipping..."
} else {
    Write-Host "Installing Atlas..."
    iex "& { $(irm https://atlasgo.sh/windows.ps1) }"
}

if (Get-Command air -ErrorAction SilentlyContinue) {
    Write-Host "Air is already installed. Skipping..."
} else {
    Write-Host "Installing Air..."
    # Check if Go is installed (required for Air)
    if (Get-Command go -ErrorAction SilentlyContinue) {
        go install github.com/air-verse/air@latest
        Write-Host "Air installed successfully."
    } else {
        Write-Host "Error: Go is not installed. Cannot install Air." -ForegroundColor Red
        Exit 1
    }
}

Write-Host "Init complete!" -ForegroundColor Green
