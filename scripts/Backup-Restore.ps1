<#
.SYNOPSIS
  Lift-and-Shift Backup and Restore Tool for eConnectOne PostgreSQL
.DESCRIPTION
  Automates encrypted backup (pg_dump) and restore (psql) between Azure PostgreSQL environments.
  Uses AES-256 encryption for backup files and uploads to Azure Blob Storage.
.EXAMPLE
  .\scripts\Backup-Restore.ps1 -Action Backup -SourceEnv prod -StorageAccountName econnectonebackups
.EXAMPLE
  .\scripts\Backup-Restore.ps1 -Action Restore -TargetEnv staging -BlobUrl https://econnectonebackups.blob.core.windows.net/backups/econnectone-prod-20250815.sql.aes -Passphrase "MySecurePassphrase123"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('Backup', 'Restore')]
    [string]$Action,

    [Parameter(Mandatory = $false)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$SourceEnv = 'prod',

    [Parameter(Mandatory = $false)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$TargetEnv = 'staging',

    [Parameter(Mandatory = $false)]
    [string]$StorageAccountName = 'econnectonebackups',

    [Parameter(Mandatory = $false)]
    [string]$ContainerName = 'backups',

    [Parameter(Mandatory = $false)]
    [string]$Passphrase,

    [Parameter(Mandatory = $false)]
    [string]$BlobUrl,

    [Parameter(Mandatory = $false)]
    [switch]$SkipBlobUpload
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

#region Logging
$LogDir = Join-Path $PSScriptRoot "..\logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = Join-Path $LogDir "backup-restore-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

function Write-Log {
    param(
        [Parameter(Mandatory)][string]$Message,
        [ValidateSet('INFO', 'WARN', 'ERROR', 'SUCCESS')][string]$Level = 'INFO'
    )
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Log -Message $Message -Level 'ERROR'
    throw $Message
}
#endregion

#region Prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..." -Level 'INFO'

    $requiredTools = @{
        'az' = 'Azure CLI'
        'pg_dump' = 'PostgreSQL client tools'
        'psql' = 'PostgreSQL client tools'
    }

    foreach ($tool in $requiredTools.Keys) {
        $cmd = Get-Command $tool -ErrorAction SilentlyContinue
        if (-not $cmd) {
            Write-ErrorLog "$($requiredTools[$tool]) not found. Please install PostgreSQL client tools."
        }
        Write-Log "Found $($requiredTools[$tool]): $($cmd.Source)" -Level 'SUCCESS'
    }

    try {
        $null = az account show 2>&1
        Write-Log "Azure CLI authenticated" -Level 'SUCCESS'
    } catch {
        Write-Log "Azure CLI not authenticated. Launching login..." -Level 'WARN'
        az login | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-ErrorLog "Azure login failed" }
    }
}
#endregion

#region Helpers
function Get-PostgresConnectionInfo {
    param(
        [Parameter(Mandatory)][ValidateSet('dev', 'staging', 'prod')][string]$Environment
    )

    $resourceGroup = "rg-econnectone-$Environment"
    $serverName = "psql-econnectone-$Environment"
    $kvName = "kv-econnectone-$Environment"

    Write-Log "Retrieving PostgreSQL connection info for $Environment..." -Level 'INFO'

    # Verify resource group exists
    $rgExists = az group show --name $resourceGroup --query name -o tsv 2>&1
    if (-not $rgExists) {
        Write-ErrorLog "Resource group '$resourceGroup' not found. Deploy infrastructure first."
    }

    # Get server FQDN from Azure
    $fqdn = az postgres flexible-server show `
        --resource-group $resourceGroup `
        --name $serverName `
        --query fullyQualifiedDomainName -o tsv 2>&1

    if (-not $fqdn) {
        Write-ErrorLog "PostgreSQL server '$serverName' not found in resource group '$resourceGroup'"
    }

    # Get admin user
    $adminUser = az postgres flexible-server show `
        --resource-group $resourceGroup `
        --name $serverName `
        --query administratorLogin -o tsv 2>&1

    # Get password from Key Vault
    $password = az keyvault secret show `
        --vault-name $kvName `
        --name POSTGRES-PASSWORD `
        --query value -o tsv 2>&1

    if (-not $password) {
        Write-ErrorLog "POSTGRES-PASSWORD not found in Key Vault '$kvName'"
    }

    $connectionString = "postgresql://${adminUser}:${password}@${fqdn}:5432/eConnectOne?sslmode=require"

    Write-Log "Connection string acquired for $Environment" -Level 'SUCCESS'
    return $connectionString
}

function Get-StorageAccountKey {
    param([string]$StorageAccountName)

    Write-Log "Retrieving storage account key for '$StorageAccountName'..." -Level 'INFO'
    $key = az storage account keys list `
        --resource-group "rg-econnectone-backups" `
        --account-name $StorageAccountName `
        --query "[0].value" -o tsv 2>&1

    if (-not $key) {
        Write-ErrorLog "Storage account '$StorageAccountName' not found or access denied"
    }

    return $key
}
#endregion

#region Backup
function Start-Backup {
    param(
        [string]$SourceEnv,
        [string]$StorageAccountName,
        [string]$ContainerName,
        [string]$Passphrase
    )

    Write-Log "=== Starting Backup from $SourceEnv ===" -Level 'INFO'

    if (-not $Passphrase) {
        $Passphrase = Read-Host "Enter encryption passphrase for backup" -AsSecureString
        $Passphrase = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Passphrase))
    }

    $connectionString = Get-PostgresConnectionInfo -Environment $SourceEnv
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupFileName = "econnectone-${SourceEnv}-${timestamp}.sql"
    $encryptedFileName = "${backupFileName}.aes"
    $localBackupPath = Join-Path $env:TEMP $backupFileName
    $localEncryptedPath = Join-Path $env:TEMP $encryptedFileName

    # Step 1: Dump database
    Write-Log "Dumping database from $SourceEnv..." -Level 'INFO'
    $env:PGPASSWORD = ($connectionString -split ':' )[2] -split '@' | Select-Object -First 1
    $host = ($connectionString -split '@' )[1] -split ':' | Select-Object -First 1

    pg_dump `
        --host=$host `
        --username=postgres `
        --dbname=eConnectOne `
        --format=plain `
        --no-owner `
        --no-acl `
        --file=$localBackupPath

    if (-not (Test-Path $localBackupPath)) {
        Write-ErrorLog "pg_dump failed. Backup file not created."
    }

    $backupSize = (Get-Item $localBackupPath).Length
    Write-Log "Backup created: $localBackupPath ($backupSize bytes)" -Level 'SUCCESS'

    # Step 2: Encrypt with AES-256 using PBKDF2 key derivation
    Write-Log "Encrypting backup with AES-256..." -Level 'INFO'

    $salt = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_})
    $pbkdf2 = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($Passphrase, [System.Text.Encoding]::UTF8.GetBytes($salt), 100000)
    $key = $pbkdf2.GetBytes(32)
    $iv = $pbkdf2.GetBytes(16)

    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Key = $key
    $aes.IV = $iv
    $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7

    $plainBytes = [System.IO.File]::ReadAllBytes($localBackupPath)
    $encryptor = $aes.CreateEncryptor()
    $encryptedBytes = $encryptor.TransformFinalBlock($plainBytes, 0, $plainBytes.Length)

    $header = [System.Text.Encoding]::UTF8.GetBytes("AES256") + [byte[]]$salt
    [System.IO.File]::WriteAllBytes($localEncryptedPath, $header + $encryptedBytes)

    Write-Log "Encrypted backup: $localEncryptedPath" -Level 'SUCCESS'

    # Step 3: Upload to Blob Storage
    if (-not $SkipBlobUpload) {
        Write-Log "Uploading to Azure Blob Storage..." -Level 'INFO'

        # Ensure container exists
        az storage container create `
            --account-name $StorageAccountName `
            --name $ContainerName `
            --public-access off `
            --auth-mode login | Out-Null

        $storageKey = Get-StorageAccountKey -StorageAccountName $StorageAccountName

        az storage blob upload `
            --account-name $StorageAccountName `
            --account-key $storageKey `
            --container-name $ContainerName `
            --name $encryptedFileName `
            --file $localEncryptedPath `
            --auth-mode key | Out-Null

        if ($LASTEXITCODE -ne 0) { Write-ErrorLog "Blob upload failed" }

        $blobUrl = "https://${StorageAccountName}.blob.core.windows.net/${ContainerName}/${encryptedFileName}"
        Write-Log "Backup uploaded: $blobUrl" -Level 'SUCCESS'

        # Cleanup local files
        Remove-Item $localBackupPath -Force
        Remove-Item $localEncryptedPath -Force

        return $blobUrl
    }

    return $localEncryptedPath
}
#endregion

#region Restore
function Start-Restore {
    param(
        [string]$TargetEnv,
        [string]$BlobUrl,
        [string]$Passphrase
    )

    Write-Log "=== Starting Restore to $TargetEnv ===" -Level 'INFO'

    if (-not $BlobUrl) {
        Write-ErrorLog "BlobUrl parameter is required for restore"
    }

    if (-not $Passphrase) {
        $Passphrase = Read-Host "Enter decryption passphrase" -AsSecureString
        $Passphrase = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Passphrase))
    }

    $connectionString = Get-PostgresConnectionInfo -Environment $TargetEnv
    $localEncryptedPath = Join-Path $env:TEMP (Split-Path $BlobUrl -Leaf)
    $localDecryptedPath = Join-Path $env.TEMP "restore-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"

    # Step 1: Download blob
    Write-Log "Downloading backup from blob storage..." -Level 'INFO'

    if ($BlobUrl -match 'https://([^\.]+)\.blob\.core\.windows\.net/([^/]+)/(.+)') {
        $storageAccountName = $matches[1]
        $containerName = $matches[2]
        $blobName = $matches[3]

        $storageKey = Get-StorageAccountKey -StorageAccountName $storageAccountName

        az storage blob download `
            --account-name $storageAccountName `
            --account-key $storageKey `
            --container-name $containerName `
            --name $blobName `
            --file $localEncryptedPath `
            --auth-mode key | Out-Null

        if ($LASTEXITCODE -ne 0) { Write-ErrorLog "Blob download failed" }
    } else {
        Write-Log "BlobUrl is a local path, copying..." -Level 'INFO'
        Copy-Item $BlobUrl $localEncryptedPath -Force
    }

    Write-Log "Backup downloaded to $localEncryptedPath" -Level 'SUCCESS'

    # Step 2: Decrypt using PBKDF2
    Write-Log "Decrypting backup..." -Level 'INFO'

    $encryptedBytes = [System.IO.File]::ReadAllBytes($localEncryptedPath)
    $header = $encryptedBytes[0..4]
    $salt = $encryptedBytes[5..20]
    $actualEncrypted = $encryptedBytes[21..($encryptedBytes.Length - 1)]

    if ([System.Text.Encoding]::UTF8.GetString($header) -ne "AES256") {
        Write-ErrorLog "Invalid backup file format. Expected AES256 header."
    }

    $pbkdf2 = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($Passphrase, $salt, 100000)
    $key = $pbkdf2.GetBytes(32)
    $iv = $pbkdf2.GetBytes(16)

    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Key = $key
    $aes.IV = $iv
    $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7

    $decryptor = $aes.CreateDecryptor()
    $decryptedBytes = $decryptor.TransformFinalBlock($actualEncrypted, 0, $actualEncrypted.Length)

    [System.IO.File]::WriteAllBytes($localDecryptedPath, $decryptedBytes)
    Write-Log "Decrypted SQL: $localDecryptedPath" -Level 'SUCCESS'

    # Step 3: Restore to target
    Write-Log "Restoring database to $TargetEnv..." -Level 'INFO'
    Write-Log "WARNING: This will DROP and recreate the database schema on $TargetEnv" -Level 'WARN'

    $confirm = Read-Host "Are you sure you want to restore to $TargetEnv? (yes/no)"
    if ($confirm -ne 'yes') {
        Write-Log "Restore cancelled by user" -Level 'WARN'
        return
    }

    $env:PGPASSWORD = ($connectionString -split ':' )[2] -split '@' | Select-Object -First 1
    $host = ($connectionString -split '@' )[1] -split ':' | Select-Object -First 1

    # Drop and recreate database
    psql -h $host -U postgres -c "DROP DATABASE IF EXISTS eConnectOne;" -v ON_ERROR_STOP=1
    psql -h $host -U postgres -c "CREATE DATABASE eConnectOne;" -v ON_ERROR_STOP=1

    psql -h $host -U postgres -d eConnectOne -f $localDecryptedPath -v ON_ERROR_STOP=1

    if ($LASTEXITCODE -ne 0) {
        Write-ErrorLog "Database restore failed"
    }

    Write-Log "Database restored successfully to $TargetEnv" -Level 'SUCCESS'

    # Step 4: Verification
    Write-Log "Verifying restore..." -Level 'INFO'

    $tableCount = psql -h $host -U postgres -d eConnectOne -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
    Write-Log "Tables restored: $tableCount" -Level 'INFO'

    # Cleanup
    Remove-Item $localEncryptedPath -Force -ErrorAction SilentlyContinue
    Remove-Item $localDecryptedPath -Force -ErrorAction SilentlyContinue

    Write-Log "=== Restore Complete ===" -Level 'SUCCESS'
}
#endregion

#region Main
function Main {
    $startTime = Get-Date
    Write-Log "========================================" -Level 'INFO'
    Write-Log "eConnectOne Lift-and-Shift: $Action" -Level 'INFO'
    Write-Log "========================================" -Level 'INFO'

    Test-Prerequisites

    if ($Action -eq 'Backup') {
        if (-not $StorageAccountName) {
            $StorageAccountName = Read-Host "Enter storage account name for backup upload"
        }
        if (-not $Passphrase) {
            $securePass = Read-Host "Enter encryption passphrase" -AsSecureString
            $Passphrase = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass))
        }
        $result = Start-Backup -SourceEnv $SourceEnv -StorageAccountName $StorageAccountName -ContainerName $ContainerName -Passphrase $Passphrase
        Write-Log "Backup result: $result" -Level 'SUCCESS'
    } elseif ($Action -eq 'Restore') {
        if (-not $BlobUrl) {
            $BlobUrl = Read-Host "Enter backup blob URL or local file path"
        }
        if (-not $Passphrase) {
            $securePass = Read-Host "Enter decryption passphrase" -AsSecureString
            $Passphrase = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass))
        }
        Start-Restore -TargetEnv $TargetEnv -BlobUrl $BlobUrl -Passphrase $Passphrase
    }

    $endTime = Get-Date
    $duration = $endTime - $startTime
    Write-Log "Operation completed in $($duration.Minutes) minutes $($duration.Seconds) seconds" -Level 'SUCCESS'
}

Main
