<#
.SYNOPSIS
  One-time Local PostgreSQL to Azure PostgreSQL migration tool for eConnectOne
.DESCRIPTION
  Dumps the local PostgreSQL database (schema + data) and restores it into the
  Azure PostgreSQL Flexible Server for the selected environment.

  This script is intended for ONE-TIME initial data migration only. It is not
  part of the routine CI/CD pipeline. Ongoing schema changes continue to flow
  through EF Core migrations in .github\workflows\azure-deploy.yml.
.EXAMPLE
  .\scripts\Migrate-LocalToAzure.ps1 -Environment prod
.EXAMPLE
  .\scripts\Migrate-LocalToAzure.ps1 -Environment staging -WhatIf -SkipConfirmation
#>

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment = 'prod',

    [Parameter(Mandatory = $false)]
    [string]$LocalConnectionString = 'Host=localhost;Port=5432;Database=eConnectOne;Username=postgres;Password=postgres@123',

    [Parameter(Mandatory = $false)]
    [switch]$SkipConfirmation
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

#region Logging
$LogDir = Join-Path $PSScriptRoot "..\logs"
$LogFile = $null

if (-not $WhatIfPreference) {
    if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
    $LogFile = Join-Path $LogDir "migrate-local-to-azure-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
}

function Write-Log {
    param(
        [Parameter(Mandatory)][string]$Message,
        [ValidateSet('INFO', 'WARN', 'ERROR', 'SUCCESS')][string]$Level = 'INFO'
    )

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry

    if (-not [string]::IsNullOrWhiteSpace($LogFile)) {
        Add-Content -Path $LogFile -Value $logEntry
    }
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Log -Message $Message -Level 'ERROR'
    throw $Message
}
#endregion

#region Prerequisites
function Invoke-AzText {
    param(
        [Parameter(Mandatory)][string[]]$Arguments,
        [switch]$AllowFailure
    )

    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = & az @Arguments 2>&1
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    $text = ($output | Out-String).Trim()

    if ($exitCode -ne 0 -and -not $AllowFailure) {
        Write-ErrorLog "Azure CLI command failed: az $($Arguments -join ' ')`n$text"
    }

    if ($exitCode -ne 0 -and $AllowFailure) {
        return $null
    }

    return $text
}

function Invoke-AzLines {
    param(
        [Parameter(Mandatory)][string[]]$Arguments,
        [switch]$AllowFailure
    )

    $text = Invoke-AzText -Arguments $Arguments -AllowFailure:$AllowFailure
    if ([string]::IsNullOrWhiteSpace($text)) {
        return @()
    }

    return @($text -split "\r?\n" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
}

function Test-AzCliAuthenticated {
    if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
        return $false
    }

    $accountId = Invoke-AzText -Arguments @('account', 'show', '--query', 'id', '-o', 'tsv') -AllowFailure
    return -not [string]::IsNullOrWhiteSpace($accountId)
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..." -Level 'INFO'

    $requiredTools = @{
        'az' = 'Azure CLI'
        'pg_dump' = 'PostgreSQL client tools'
        'pg_restore' = 'PostgreSQL client tools'
    }

    foreach ($tool in $requiredTools.Keys) {
        $cmd = Get-Command $tool -ErrorAction SilentlyContinue
        if (-not $cmd) {
            if ($WhatIfPreference) {
                Write-Log "$($requiredTools[$tool]) not found. WhatIf mode will continue without executing that tool." -Level 'WARN'
                continue
            }

            Write-ErrorLog "$($requiredTools[$tool]) not found. Please install it first."
        }
        Write-Log "Found $($requiredTools[$tool]): $($cmd.Source)" -Level 'SUCCESS'
    }

    if ($WhatIfPreference) {
        if (Test-AzCliAuthenticated) {
            Write-Log "Azure CLI is authenticated (live resource discovery available during WhatIf)" -Level 'SUCCESS'
        } else {
            Write-Log "Azure CLI is not authenticated. WhatIf mode will use expected naming patterns only." -Level 'WARN'
        }
        return
    }

    if (Test-AzCliAuthenticated) {
        Write-Log "Azure CLI is authenticated" -Level 'SUCCESS'
        return
    }

    Write-Log "Azure CLI not authenticated. Launching login..." -Level 'WARN'
    az login | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-ErrorLog "Azure login failed" }
    Write-Log "Azure CLI is authenticated" -Level 'SUCCESS'
}
#endregion

#region Connection Helpers
function Get-ConnectionMapValue {
    param(
        [Parameter(Mandatory)][hashtable]$Map,
        [Parameter(Mandatory)][string[]]$Keys
    )

    foreach ($key in $Keys) {
        $lookupKey = $key.ToLowerInvariant()
        if ($Map.ContainsKey($lookupKey)) {
            return $Map[$lookupKey]
        }
    }

    return $null
}

function ConvertTo-PostgresConnectionInfo {
    param(
        [Parameter(Mandatory)][string]$ConnectionString,
        [Parameter(Mandatory)][string]$Label
    )

    if ($ConnectionString -match '^postgres(ql)?://') {
        try {
            $uri = [System.Uri]$ConnectionString
        } catch {
            Write-ErrorLog "$Label is not a valid PostgreSQL URI connection string."
        }

        $userInfoParts = $uri.UserInfo -split ':', 2
        if ($userInfoParts.Count -lt 2) {
            Write-ErrorLog "$Label must include both username and password."
        }

        $databaseName = $uri.AbsolutePath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($databaseName)) {
            Write-ErrorLog "$Label must include a database name."
        }

        $sslMode = $null
        if ($uri.Query -match '(?i)(?:\?|&)sslmode=([^&]+)') {
            $sslMode = [System.Uri]::UnescapeDataString($matches[1])
        }

        return [pscustomobject]@{
            Host     = $uri.Host
            Port     = $(if ($uri.Port -gt 0) { $uri.Port } else { 5432 })
            Database = $databaseName
            Username = [System.Uri]::UnescapeDataString($userInfoParts[0])
            Password = [System.Uri]::UnescapeDataString($userInfoParts[1])
            SslMode  = $sslMode
        }
    }

    $parts = @{}
    foreach ($segment in $ConnectionString -split ';') {
        if ([string]::IsNullOrWhiteSpace($segment)) { continue }
        $pair = $segment -split '=', 2
        if ($pair.Count -ne 2) { continue }
        $parts[$pair[0].Trim().ToLowerInvariant()] = $pair[1].Trim()
    }

    $dbHost = Get-ConnectionMapValue -Map $parts -Keys @('host', 'server')
    $port = Get-ConnectionMapValue -Map $parts -Keys @('port')
    $database = Get-ConnectionMapValue -Map $parts -Keys @('database', 'initial catalog', 'dbname')
    $username = Get-ConnectionMapValue -Map $parts -Keys @('username', 'user id', 'user', 'userid')
    $password = Get-ConnectionMapValue -Map $parts -Keys @('password', 'pwd')
    $sslMode = Get-ConnectionMapValue -Map $parts -Keys @('ssl mode', 'sslmode')

    if ([string]::IsNullOrWhiteSpace($dbHost) -or
        [string]::IsNullOrWhiteSpace($database) -or
        [string]::IsNullOrWhiteSpace($username) -or
        [string]::IsNullOrWhiteSpace($password)) {
        Write-ErrorLog "$Label is missing one or more required values (Host, Database, Username, Password)."
    }

    return [pscustomobject]@{
        Host     = $dbHost
        Port     = $(if ([string]::IsNullOrWhiteSpace($port)) { 5432 } else { [int]$port })
        Database = $database
        Username = $username
        Password = $password
        SslMode  = $sslMode
    }
}

function Save-PostgresEnvironment {
    $saved = @{}
    foreach ($name in @('PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGSSLMODE')) {
        $item = Get-Item "Env:$name" -ErrorAction SilentlyContinue
        if ($item) {
            $saved[$name] = $item.Value
        } else {
            $saved[$name] = $null
        }
    }
    return $saved
}

function Restore-PostgresEnvironment {
    param([Parameter(Mandatory)][hashtable]$Saved)

    foreach ($name in $Saved.Keys) {
        if ($null -eq $Saved[$name]) {
            Remove-Item "Env:$name" -ErrorAction SilentlyContinue
        } else {
            Set-Item "Env:$name" -Value $Saved[$name]
        }
    }
}

function Set-PostgresEnvironment {
    param([Parameter(Mandatory)]$Connection)

    $env:PGHOST = $Connection.Host
    $env:PGPORT = [string]$Connection.Port
    $env:PGDATABASE = $Connection.Database
    $env:PGUSER = $Connection.Username
    $env:PGPASSWORD = $Connection.Password

    if ([string]::IsNullOrWhiteSpace($Connection.SslMode)) {
        Remove-Item Env:PGSSLMODE -ErrorAction SilentlyContinue
    } else {
        $env:PGSSLMODE = $Connection.SslMode
    }
}
#endregion

#region Azure Helpers
function Resolve-ExpectedOrActualName {
    param(
        [Parameter(Mandatory)][string]$FriendlyName,
        [Parameter(Mandatory)][string]$DefaultName,
        [Parameter(Mandatory)][string]$Prefix,
        [Parameter(Mandatory)][string[]]$ListArguments,
        [Parameter(Mandatory)][bool]$CanQueryAzure
    )

    if (-not $CanQueryAzure) {
        Write-Log "Using expected $FriendlyName name '$DefaultName' (live Azure lookup skipped)." -Level 'WARN'
        return $DefaultName
    }

    $candidates = Invoke-AzLines -Arguments $ListArguments
    $matches = @($candidates | Where-Object { $_ -like "$Prefix*" })

    if ($matches.Count -eq 0) {
        Write-ErrorLog "No $FriendlyName found in Azure matching '$Prefix*'."
    }

    if ($matches -contains $DefaultName) {
        Write-Log "Resolved ${FriendlyName}: $DefaultName" -Level 'SUCCESS'
        return $DefaultName
    }

    if ($matches.Count -eq 1) {
        Write-Log "Resolved ${FriendlyName}: $($matches[0])" -Level 'SUCCESS'
        return $matches[0]
    }

    Write-ErrorLog "Multiple $FriendlyName resources matched '$Prefix*': $($matches -join ', '). Please clean up duplicates or adjust the script."
}

function Get-KeyVaultSecretIfExists {
    param(
        [Parameter(Mandatory)][string]$VaultName,
        [Parameter(Mandatory)][string]$SecretName,
        [Parameter(Mandatory)][bool]$CanQueryAzure
    )

    if (-not $CanQueryAzure) {
        return $null
    }

    return Invoke-AzText -Arguments @(
        'keyvault', 'secret', 'show',
        '--vault-name', $VaultName,
        '--name', $SecretName,
        '--query', 'value',
        '-o', 'tsv'
    ) -AllowFailure
}

function Get-AzureTargetConnectionInfo {
    param(
        [Parameter(Mandatory)][ValidateSet('dev', 'staging', 'prod')][string]$Environment,
        [Parameter(Mandatory)][bool]$CanQueryAzure
    )

    $resourceGroup = "rg-econnectone-$Environment"
    $defaultServerName = "pg-econn-$Environment-ec1"
    $defaultKeyVaultName = "kv-econn-$Environment-ec1"

    if ($CanQueryAzure) {
        $existingResourceGroup = Invoke-AzText -Arguments @('group', 'show', '--name', $resourceGroup, '--query', 'name', '-o', 'tsv') -AllowFailure
        if ($existingResourceGroup -ne $resourceGroup) {
            Write-ErrorLog "Resource group '$resourceGroup' not found."
        }
        Write-Log "Resource group '$resourceGroup' found" -Level 'SUCCESS'
    } else {
        Write-Log "Skipping live resource group lookup for '$resourceGroup' because Azure CLI is not authenticated." -Level 'WARN'
    }

    $serverName = Resolve-ExpectedOrActualName `
        -FriendlyName 'PostgreSQL server' `
        -DefaultName $defaultServerName `
        -Prefix "pg-econn-$Environment-" `
        -ListArguments @('postgres', 'flexible-server', 'list', '--resource-group', $resourceGroup, '--query', '[].name', '-o', 'tsv') `
        -CanQueryAzure $CanQueryAzure

    $keyVaultName = Resolve-ExpectedOrActualName `
        -FriendlyName 'Key Vault' `
        -DefaultName $defaultKeyVaultName `
        -Prefix "kv-econn-$Environment-" `
        -ListArguments @('keyvault', 'list', '--resource-group', $resourceGroup, '--query', '[].name', '-o', 'tsv') `
        -CanQueryAzure $CanQueryAzure

    $fqdn = $null
    $adminUser = 'pgadmin'

    if ($CanQueryAzure) {
        $fqdn = Invoke-AzText -Arguments @(
            'postgres', 'flexible-server', 'show',
            '--resource-group', $resourceGroup,
            '--name', $serverName,
            '--query', 'fullyQualifiedDomainName',
            '-o', 'tsv'
        )

        $adminUser = Invoke-AzText -Arguments @(
            'postgres', 'flexible-server', 'show',
            '--resource-group', $resourceGroup,
            '--name', $serverName,
            '--query', 'administratorLogin',
            '-o', 'tsv'
        )
    } else {
        $fqdn = "$serverName.postgres.database.azure.com"
    }

    if ([string]::IsNullOrWhiteSpace($fqdn)) {
        Write-ErrorLog "Unable to resolve the Azure PostgreSQL server FQDN."
    }

    $password = $null
    $passwordSource = $null

    $password = Get-KeyVaultSecretIfExists -VaultName $keyVaultName -SecretName 'POSTGRES-PASSWORD' -CanQueryAzure $CanQueryAzure
    if (-not [string]::IsNullOrWhiteSpace($password)) {
        $passwordSource = "Key Vault secret 'POSTGRES-PASSWORD'"
    }

    if ([string]::IsNullOrWhiteSpace($password)) {
        $connectionSecret = Get-KeyVaultSecretIfExists -VaultName $keyVaultName -SecretName 'POSTGRES-CONNECTION-STRING' -CanQueryAzure $CanQueryAzure
        if (-not [string]::IsNullOrWhiteSpace($connectionSecret)) {
            $parsedSecret = ConvertTo-PostgresConnectionInfo -ConnectionString $connectionSecret -Label "Key Vault secret 'POSTGRES-CONNECTION-STRING'"
            $password = $parsedSecret.Password
            $passwordSource = "Key Vault secret 'POSTGRES-CONNECTION-STRING'"
        }
    }

    if ([string]::IsNullOrWhiteSpace($password)) {
        $databaseUrlSecret = Get-KeyVaultSecretIfExists -VaultName $keyVaultName -SecretName 'DATABASE-URL' -CanQueryAzure $CanQueryAzure
        if (-not [string]::IsNullOrWhiteSpace($databaseUrlSecret) -and $databaseUrlSecret -notmatch '\*{3,}') {
            $parsedSecret = ConvertTo-PostgresConnectionInfo -ConnectionString $databaseUrlSecret -Label "Key Vault secret 'DATABASE-URL'"
            $password = $parsedSecret.Password
            $passwordSource = "Key Vault secret 'DATABASE-URL'"
        } elseif (-not [string]::IsNullOrWhiteSpace($databaseUrlSecret)) {
            Write-Log "Key Vault secret 'DATABASE-URL' does not expose the actual password value. Falling back to other sources." -Level 'WARN'
        }
    }

    if ([string]::IsNullOrWhiteSpace($password) -and -not [string]::IsNullOrWhiteSpace($env:AZURE_POSTGRES_PASSWORD)) {
        $password = $env:AZURE_POSTGRES_PASSWORD
        $passwordSource = 'AZURE_POSTGRES_PASSWORD environment variable'
    }

    if ([string]::IsNullOrWhiteSpace($password) -and -not $WhatIfPreference) {
        Write-ErrorLog "Unable to determine the Azure PostgreSQL admin password. Add a Key Vault secret such as 'POSTGRES-PASSWORD' or set AZURE_POSTGRES_PASSWORD before running this migration."
    }

    if ([string]::IsNullOrWhiteSpace($password) -and $WhatIfPreference) {
        $passwordSource = 'not resolved in WhatIf mode'
    }

    return [pscustomobject]@{
        Host           = $fqdn
        Port           = 5432
        Database       = 'eConnectOne'
        Username       = $adminUser
        Password       = $password
        SslMode        = 'require'
        ResourceGroup  = $resourceGroup
        ServerName     = $serverName
        KeyVaultName   = $keyVaultName
        PasswordSource = $passwordSource
    }
}
#endregion

#region Migration
function Confirm-Migration {
    param(
        [Parameter(Mandatory)]$LocalConnection,
        [Parameter(Mandatory)]$AzureConnection
    )

    Write-Log "Local source: $($LocalConnection.Host):$($LocalConnection.Port)/$($LocalConnection.Database) as $($LocalConnection.Username)" -Level 'INFO'
    Write-Log "Azure target: $($AzureConnection.Host):$($AzureConnection.Port)/$($AzureConnection.Database) as $($AzureConnection.Username)" -Level 'INFO'
    Write-Log "Target resource group: $($AzureConnection.ResourceGroup)" -Level 'INFO'
    Write-Log "Target Key Vault: $($AzureConnection.KeyVaultName)" -Level 'INFO'
    Write-Log "Password source: $($AzureConnection.PasswordSource)" -Level 'INFO'
    Write-Log "This operation will overwrite objects in the Azure database using pg_restore --clean --if-exists." -Level 'WARN'

    if ($WhatIfPreference) {
        Write-Log "WhatIf mode enabled. No dump or restore commands will be executed." -Level 'WARN'
        return
    }

    if ($SkipConfirmation) {
        Write-Log "Skipping confirmation prompt (flag set)" -Level 'WARN'
        return
    }

    $confirmation = Read-Host "Type YES to migrate the local database into Azure '$Environment'"
    if ($confirmation -cne 'YES') {
        Write-Log "Migration cancelled by user" -Level 'WARN'
        exit 0
    }
}

function Invoke-PgDumpArchive {
    param(
        [Parameter(Mandatory)]$Connection,
        [Parameter(Mandatory)][string]$DumpPath
    )

    $savedEnvironment = Save-PostgresEnvironment
    try {
        Set-PostgresEnvironment -Connection $Connection

        Write-Log "Creating local pg_dump archive..." -Level 'INFO'
        & pg_dump '--format=custom' '--no-owner' '--no-acl' '--file' $DumpPath $Connection.Database
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorLog "pg_dump failed."
        }

        if (-not (Test-Path $DumpPath)) {
            Write-ErrorLog "pg_dump did not create the expected archive: $DumpPath"
        }

        $size = (Get-Item $DumpPath).Length
        Write-Log "Dump archive created: $DumpPath ($size bytes)" -Level 'SUCCESS'
    } finally {
        Restore-PostgresEnvironment -Saved $savedEnvironment
    }
}

function Invoke-PgRestoreArchive {
    param(
        [Parameter(Mandatory)]$Connection,
        [Parameter(Mandatory)][string]$DumpPath
    )

    $savedEnvironment = Save-PostgresEnvironment
    try {
        Set-PostgresEnvironment -Connection $Connection

        Write-Log "Restoring archive into Azure PostgreSQL..." -Level 'INFO'
        & pg_restore '--clean' '--if-exists' '--no-owner' '--no-acl' '--single-transaction' '--exit-on-error' '--dbname' $Connection.Database $DumpPath
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorLog "pg_restore failed."
        }

        Write-Log "Azure PostgreSQL restore completed successfully" -Level 'SUCCESS'
    } finally {
        Restore-PostgresEnvironment -Saved $savedEnvironment
    }
}
#endregion

#region Main
function Main {
    $startTime = Get-Date

    Write-Log "========================================" -Level 'INFO'
    Write-Log "eConnectOne One-Time Local -> Azure Migration" -Level 'INFO'
    Write-Log "Environment: $Environment" -Level 'INFO'
    Write-Log "========================================" -Level 'INFO'

    Test-Prerequisites

    $canQueryAzure = Test-AzCliAuthenticated
    $localConnection = ConvertTo-PostgresConnectionInfo -ConnectionString $LocalConnectionString -Label 'LocalConnectionString'
    $azureConnection = Get-AzureTargetConnectionInfo -Environment $Environment -CanQueryAzure $canQueryAzure

    Confirm-Migration -LocalConnection $localConnection -AzureConnection $azureConnection

    $artifactDir = Join-Path $PSScriptRoot "..\artifacts"
    $dumpPath = Join-Path $artifactDir "local-to-azure-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss').dump"
    $keepDumpForTroubleshooting = $false

    try {
        if ($WhatIfPreference) {
            Write-Log "WhatIf: Would run pg_dump against the local database and pg_restore into '$($azureConnection.Host)' with sslmode=require." -Level 'WARN'
            return
        }

        if (-not (Test-Path $artifactDir)) { New-Item -ItemType Directory -Path $artifactDir -Force | Out-Null }

        Invoke-PgDumpArchive -Connection $localConnection -DumpPath $dumpPath
        Invoke-PgRestoreArchive -Connection $azureConnection -DumpPath $dumpPath
    } catch {
        $keepDumpForTroubleshooting = Test-Path $dumpPath
        throw
    } finally {
        if (Test-Path $dumpPath) {
            if ($keepDumpForTroubleshooting) {
                Write-Log "Leaving dump archive in place for troubleshooting: $dumpPath" -Level 'WARN'
            } else {
                Remove-Item $dumpPath -Force -ErrorAction SilentlyContinue
                Write-Log "Removed temporary dump archive: $dumpPath" -Level 'INFO'
            }
        }

        $endTime = Get-Date
        $duration = $endTime - $startTime
        Write-Log "Operation completed in $($duration.Minutes) minutes $($duration.Seconds) seconds" -Level 'SUCCESS'
    }
}

Main
#endregion
