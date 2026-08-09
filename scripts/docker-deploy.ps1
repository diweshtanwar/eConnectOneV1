<#
.SYNOPSIS
  Helper script to manage Docker Desktop local deployment for eConnectOne.

.DESCRIPTION
  Provides commands to start dev or production compose stacks, validate the backend, stream logs, and tear down.

.EXAMPLE
  .\docker-deploy.ps1 -Action Start-Dev
  .\docker-deploy.ps1 -Action Validate
#>
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Start-Dev','Start-Prod','Validate','Logs','Stop','Down','Status','Help')]
    [string]$Action = 'Help'
)

function Check-Requirements {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker CLI not found. Please install Docker Desktop and ensure 'docker' is on PATH."
        exit 1
    }

    try {
        docker version | Out-Null
    }
    catch {
        Write-Error "Cannot contact Docker daemon. Is Docker Desktop running?"
        exit 1
    }
}

function Start-Dev {
    Write-Host "Starting development stack (compose)" -ForegroundColor Cyan
    docker compose up --build -d
    Write-Host "Started dev stack. Run `.\docker-deploy.ps1 -Action Validate` to validate." -ForegroundColor Green
}

function Start-Prod {
    Write-Host "Starting production-style stack (compose.prod) in detached mode" -ForegroundColor Cyan
    docker compose -f docker-compose.prod.yml up --build -d
    Write-Host "Started production stack." -ForegroundColor Green
}

function Wait-For-Endpoint {
    param(
        [string]$Url = 'http://localhost:10000/health',
        [int]$Retries = 30,
        [int]$DelaySec = 2
    )

    Write-Host "Waiting for endpoint: $Url" -ForegroundColor Cyan
    for ($i=1; $i -le $Retries; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
                Write-Host "Endpoint is healthy (HTTP $($resp.StatusCode))." -ForegroundColor Green
                return $true
            }
        }
        catch {
            Write-Host -NoNewline "."
        }
        Start-Sleep -Seconds $DelaySec
    }
    Write-Host "`nTimed out waiting for endpoint." -ForegroundColor Yellow
    return $false
}

function Validate-Deployment {
    Write-Host "Validating deployment..." -ForegroundColor Cyan

    # Check containers
    docker ps --format "table {{.Names}}	{{.Image}}	{{.Status}}" | Write-Host

    # Check backend health endpoint
    $healthPaths = @('http://localhost:10000/health','http://localhost:10000/swagger','http://localhost:10000')
    $ok = $false
    foreach ($p in $healthPaths) {
        if (Wait-For-Endpoint -Url $p -Retries 8 -DelaySec 2) { $ok = $true; break }
    }

    if ($ok) {
        Write-Host "Deployment looks healthy." -ForegroundColor Green
        return 0
    }
    else {
        Write-Host "Deployment may not be healthy. Inspect logs: docker compose logs -f" -ForegroundColor Red
        return 1
    }
}

function Show-Logs {
    param(
        [string]$Service = ''
    )
    if ($Service) {
        docker compose logs -f $Service
    }
    else {
        docker compose logs -f
    }
}

function Stop-Stack {
    Write-Host "Stopping stack (docker compose down)" -ForegroundColor Cyan
    docker compose down
}

function Down-Prod {
    Write-Host "Stopping production stack (docker compose.prod down -v)" -ForegroundColor Cyan
    docker compose -f docker-compose.prod.yml down -v
}

function Show-Status {
    docker ps -a --format "table {{.Names}}	{{.Image}}	{{.Status}}"
    docker images --format "table {{.Repository}}:{{.Tag}}	{{.ID}}	{{.Size}}"
}

switch ($Action) {
    'Start-Dev' { Check-Requirements; Start-Dev }
    'Start-Prod' { Check-Requirements; Start-Prod }
    'Validate' { Check-Requirements; Validate-Deployment }
    'Logs' { Check-Requirements; Show-Logs }
    'Stop' { Check-Requirements; Stop-Stack }
    'Down' { Check-Requirements; Down-Prod }
    'Status' { Check-Requirements; Show-Status }
    'Help' {
        Get-Help -Full -ErrorAction SilentlyContinue
        Write-Host "`nUsage: .\docker-deploy.ps1 -Action <Start-Dev|Start-Prod|Validate|Logs|Stop|Down|Status|Help>" -ForegroundColor Cyan
    }
    default { Write-Host "Unknown action. Use -Action Help" -ForegroundColor Yellow }
}
