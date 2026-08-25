<#
.SYNOPSIS
  Syncs the local eConnectOne PostgreSQL database to the Azure PostgreSQL Flexible Server,
  overwriting whatever is currently in the Azure database.
.DESCRIPTION
  Dumps the local "eConnectOne" database (schema + data) with pg_dump and restores it into
  the Azure PostgreSQL Flexible Server with pg_restore --clean --if-exists, so the Azure
  database ends up matching the local one exactly.

  This is a manual, one-time (or occasional) data sync tool. It is NOT part of the automated
  CI/CD pipeline in .github\workflows\azure-deploy.yml, which only applies EF Core schema
  migrations (it never touches data).
.PARAMETER AzureHost
  Azure PostgreSQL Flexible Server hostname.
.PARAMETER AzureUser
  Azure PostgreSQL admin username.
.PARAMETER LocalConnectionString
  Local PostgreSQL connection string (EF Core "Server=...;Port=...;..." format).
.EXAMPLE
  .\scripts\Sync-LocalDbToAzure.ps1
.EXAMPLE
  .\scripts\Sync-LocalDbToAzure.ps1 -WhatIf
#>

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory = $false)]
    [string]$AzureHost = 'pg-econn-prod-ec1.postgres.database.azure.com',

    [Parameter(Mandatory = $false)]
    [int]$AzurePort = 5432,

    [Parameter(Mandatory = $false)]
    [string]$AzureDatabase = 'eConnectOne',

    [Parameter(Mandatory = $false)]
    [string]$AzureUser = 'pgadmin',

    [Parameter(Mandatory = $false)]
    [string]$LocalHost = 'localhost',

    [Parameter(Mandatory = $false)]
    [int]$LocalPort = 5432,

    [Parameter(Mandatory = $false)]
    [string]$LocalDatabase = 'eConnectOne',

    [Parameter(Mandatory = $false)]
    [string]$LocalUser = 'postgres',

    [Parameter(Mandatory = $false)]
    [switch]$SkipConfirmation,

    [Parameter(Mandatory = $false)]
    [string]$LocalDbPassword,

    [Parameter(Mandatory = $false)]
    [string]$AzureDbPassword
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

#region Logging
$LogDir = Join-Path $PSScriptRoot "..\logs"
if (-not $WhatIfPreference -and -not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}
$LogFile = if (-not $WhatIfPreference) {
    Join-Path $LogDir "sync-local-to-azure-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
} else { $null }

function Write-Log {
    param(
        [Parameter(Mandatory)][string]$Message,
        [ValidateSet('INFO', 'WARN', 'ERROR', 'SUCCESS')][string]$Level = 'INFO'
    )
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $entry = "[$timestamp] [$Level] $Message"
    Write-Host $entry
    if ($LogFile) { Add-Content -Path $LogFile -Value $entry }
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Log -Message $Message -Level 'ERROR'
    throw $Message
}
#endregion

#region Prerequisites
function Find-PostgresBinDir {
    # Prefer whatever is already on PATH.
    $cmd = Get-Command 'pg_dump' -ErrorAction SilentlyContinue
    if ($cmd) { return Split-Path $cmd.Source -Parent }

    # Fall back to common Windows install locations (highest version first).
    $candidates = Get-ChildItem 'C:\Program Files\PostgreSQL' -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '^\d+$' } |
        Sort-Object { [int]$_.Name } -Descending
    foreach ($dir in $candidates) {
        $binPath = Join-Path $dir.FullName 'bin'
        if (Test-Path (Join-Path $binPath 'pg_dump.exe')) { return $binPath }
    }
    return $null
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..." -Level 'INFO'

    $binDir = Find-PostgresBinDir
    if (-not $binDir) {
        Write-ErrorLog "PostgreSQL client tools (pg_dump/pg_restore/psql) not found. Install PostgreSQL client tools and re-run."
    }

    # Prepend to PATH for this process so pg_dump/pg_restore/psql resolve without full paths.
    if ($env:Path -notlike "*$binDir*") {
        $env:Path = "$binDir;$env:Path"
    }
    Write-Log "Using PostgreSQL client tools from: $binDir" -Level 'SUCCESS'

    foreach ($tool in @('pg_dump', 'pg_restore', 'psql')) {
        $cmd = Get-Command $tool -ErrorAction SilentlyContinue
        if (-not $cmd) {
            Write-ErrorLog "'$tool' still not found after adding '$binDir' to PATH."
        }
    }
}
#endregion

function Test-PostgresConnection {
    param(
        [Parameter(Mandatory)][string]$Label,
        [Parameter(Mandatory)][string]$TargetHost,
        [Parameter(Mandatory)][int]$Port,
        [Parameter(Mandatory)][string]$Database,
        [Parameter(Mandatory)][string]$Username,
        [Parameter(Mandatory)][string]$Password
    )

    $env:PGPASSWORD = $Password
    try {
        $null = & psql -h $TargetHost -p $Port -U $Username -d $Database -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorLog "$Label connection test failed. Check host/port/username/password and firewall rules."
        }
        Write-Log "$Label connection OK (${TargetHost}:${Port}/${Database})" -Level 'SUCCESS'
    } finally {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}

function Invoke-Dump {
    param(
        [Parameter(Mandatory)][string]$TargetHost,
        [Parameter(Mandatory)][int]$Port,
        [Parameter(Mandatory)][string]$Database,
        [Parameter(Mandatory)][string]$Username,
        [Parameter(Mandatory)][string]$Password,
        [Parameter(Mandatory)][string]$DumpPath
    )

    $env:PGPASSWORD = $Password
    try {
        Write-Log "Dumping local database '$Database' from $TargetHost..." -Level 'INFO'
        # Plain-SQL format (not --format=custom) so we can strip out any GUCs the
        # local pg_dump version embeds that the Azure server's older PG version
        # doesn't recognize (e.g. "transaction_timeout", added in PG17).
        & pg_dump -h $TargetHost -p $Port -U $Username --format=plain --clean --if-exists --no-owner --no-acl --file $DumpPath $Database
        if ($LASTEXITCODE -ne 0) { Write-ErrorLog "pg_dump failed." }
        if (-not (Test-Path $DumpPath)) { Write-ErrorLog "pg_dump did not produce a file at $DumpPath." }

        # Remove SET statements for GUCs that may not exist on an older server version.
        $filtered = Get-Content -Path $DumpPath | Where-Object { $_ -notmatch '^\s*SET\s+transaction_timeout\s*=' }
        Set-Content -Path $DumpPath -Value $filtered -Encoding UTF8

        $size = (Get-Item $DumpPath).Length
        Write-Log "Dump created: $DumpPath ($size bytes)" -Level 'SUCCESS'
    } finally {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}

function Invoke-Restore {
    param(
        [Parameter(Mandatory)][string]$TargetHost,
        [Parameter(Mandatory)][int]$Port,
        [Parameter(Mandatory)][string]$Database,
        [Parameter(Mandatory)][string]$Username,
        [Parameter(Mandatory)][string]$Password,
        [Parameter(Mandatory)][string]$DumpPath
    )

    $env:PGPASSWORD = $Password
    try {
        Write-Log "Restoring into Azure database '$Database' on $TargetHost (this overwrites existing objects)..." -Level 'WARN'
        & psql -h $TargetHost -p $Port -U $Username -d $Database -v ON_ERROR_STOP=1 --single-transaction -f $DumpPath
        if ($LASTEXITCODE -ne 0) { Write-ErrorLog "psql restore failed." }
        Write-Log "Azure PostgreSQL restore completed successfully." -Level 'SUCCESS'
    } finally {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}

#region Main
function Main {
    $startTime = Get-Date
    Write-Log "========================================" -Level 'INFO'
    Write-Log "eConnectOne Local -> Azure DB Sync" -Level 'INFO'
    Write-Log "========================================" -Level 'INFO'

    Test-Prerequisites

    Write-Log "Local source:  $LocalUser@${LocalHost}:$LocalPort/$LocalDatabase" -Level 'INFO'
    Write-Log "Azure target:  $AzureUser@${AzureHost}:$AzurePort/$AzureDatabase" -Level 'INFO'
    Write-Log "This will OVERWRITE all data/schema in the Azure database with the local copy." -Level 'WARN'

    if (-not $WhatIfPreference -and -not $SkipConfirmation) {
        $confirmation = Read-Host "Type YES to overwrite the Azure database with your local data"
        if ($confirmation -cne 'YES') {
            Write-Log "Sync cancelled by user." -Level 'WARN'
            return
        }
    }

    if ($WhatIfPreference) {
        Write-Log "WhatIf: would prompt for local/Azure passwords, test both connections, pg_dump local, then pg_restore into Azure. No changes made." -Level 'WARN'
        return
    }

    $localPassword = if ($LocalDbPassword) { $LocalDbPassword } else {
        $secure = Read-Host "Enter LOCAL Postgres password for user '$LocalUser'" -AsSecureString
        [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
    }
    $azurePassword = if ($AzureDbPassword) { $AzureDbPassword } else {
        $secure = Read-Host "Enter AZURE Postgres password for user '$AzureUser'" -AsSecureString
        [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
    }

    Test-PostgresConnection -Label 'Local' -TargetHost $LocalHost -Port $LocalPort -Database $LocalDatabase -Username $LocalUser -Password $localPassword
    Test-PostgresConnection -Label 'Azure' -TargetHost $AzureHost -Port $AzurePort -Database $AzureDatabase -Username $AzureUser -Password $azurePassword

    $artifactDir = Join-Path $PSScriptRoot "..\artifacts"
    if (-not (Test-Path $artifactDir)) { New-Item -ItemType Directory -Path $artifactDir -Force | Out-Null }
    $dumpPath = Join-Path $artifactDir "local-to-azure-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"

    $keepDump = $false
    try {
        Invoke-Dump -TargetHost $LocalHost -Port $LocalPort -Database $LocalDatabase -Username $LocalUser -Password $localPassword -DumpPath $dumpPath
        Invoke-Restore -TargetHost $AzureHost -Port $AzurePort -Database $AzureDatabase -Username $AzureUser -Password $azurePassword -DumpPath $dumpPath
    } catch {
        $keepDump = Test-Path $dumpPath
        throw
    } finally {
        if (Test-Path $dumpPath) {
            if ($keepDump) {
                Write-Log "Leaving dump archive for troubleshooting: $dumpPath" -Level 'WARN'
            } else {
                Remove-Item $dumpPath -Force -ErrorAction SilentlyContinue
                Write-Log "Removed temporary dump archive." -Level 'INFO'
            }
        }
        $duration = (Get-Date) - $startTime
        Write-Log "Completed in $($duration.Minutes)m $($duration.Seconds)s" -Level 'SUCCESS'
    }
}

Main
#endregion
