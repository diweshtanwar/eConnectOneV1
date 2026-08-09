$BackendPath = "E:\Projects\Source\eConnectOne\backend\eConnectOne.API"
$FrontendPath = "E:\Projects\Source\eConnectOne\frontend"

Write-Host "Starting Backend API..." -ForegroundColor Green
Start-Process -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory $BackendPath

Write-Host "Starting Frontend Development Server..." -ForegroundColor Green
Set-Location $FrontendPath
npm run dev
