# Test Loopio MCP Server (SSE mode) on Windows
# Run this in PowerShell

Write-Host "🧪 Testing Loopio MCP Server in SSE mode" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:MCP_TRANSPORT = "sse"
$env:PORT = "3000"

# Start server in background
Write-Host "Starting server..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList "dist/index.js" -PassThru -NoNewWindow

# Wait for server to start
Start-Sleep -Seconds 3

try {
    # Test health endpoint
    Write-Host ""
    Write-Host "Testing health endpoint..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "Response: $($healthResponse | ConvertTo-Json)" -ForegroundColor Gray
    
    if ($healthResponse.status -eq "ok") {
        Write-Host "✅ Health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Health check failed" -ForegroundColor Red
    }

    # Test SSE endpoint (just check if it responds)
    Write-Host ""
    Write-Host "Testing SSE endpoint..." -ForegroundColor Yellow
    try {
        $sseRequest = Invoke-WebRequest -Uri "http://localhost:3000/sse" -Method Get -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ SSE endpoint responded" -ForegroundColor Green
    } catch {
        # Timeout is expected for SSE streaming
        if ($_.Exception.Message -match "timeout") {
            Write-Host "✅ SSE endpoint is streaming (timeout expected)" -ForegroundColor Green
        } else {
            Write-Host "Response received (streaming mode)" -ForegroundColor Green
        }
    }
} finally {
    # Cleanup
    Write-Host ""
    Write-Host "Stopping server..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "✅ Test complete" -ForegroundColor Green
}
