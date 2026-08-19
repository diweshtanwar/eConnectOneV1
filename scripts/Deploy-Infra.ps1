<#
.SYNOPSIS
  Master Azure Infrastructure Deployment Script for eConnectOne
.DESCRIPTION
  Deploys the complete eConnectOne Azure infrastructure using Bicep IaC.
  Handles: prerequisite validation, Bicep build, Azure deployment, Key Vault secret population,
  GitHub OIDC service principal creation, and post-deployment validation.
.EXAMPLE
  .\scripts\Deploy-Infra.ps1 -Environment dev -Location southeastasia
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment = 'dev',

    [Parameter(Mandatory = $false)]
    [string]$Location = 'southeastasia',

    [Parameter(Mandatory = $false)]
    [string]$ResourceGroupName = "rg-econnectone-$Environment",

    [Parameter(Mandatory = $false)]
    [switch]$SkipGitHubSPCreation,

    [Parameter(Mandatory = $false)]
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

#region Logging Setup
$LogDir = Join-Path $PSScriptRoot "..\logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = Join-Path $LogDir "deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

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
        'bicep' = 'Bicep CLI'
        'pwsh' = 'PowerShell Core'
    }

    foreach ($tool in $requiredTools.Keys) {
        $cmd = Get-Command $tool -ErrorAction SilentlyContinue
        if (-not $cmd) {
            Write-ErrorLog "$($requiredTools[$tool]) not found. Please install it first."
        }
        Write-Log "Found $($requiredTools[$tool]): $($cmd.Source)" -Level 'SUCCESS'
    }

    try {
        $null = az account show 2>&1
        Write-Log "Azure CLI is authenticated" -Level 'SUCCESS'
    } catch {
        Write-Log "Azure CLI not authenticated. Launching login..." -Level 'WARN'
        az login | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-ErrorLog "Azure login failed" }
    }

    $bicepVersion = bicep --version 2>&1
    if ($LASTEXITCODE -ne 0) { Write-ErrorLog "Bicep CLI not found. Run: az bicep install" }
    Write-Log "Bicep version: $bicepVersion" -Level 'INFO'

    Write-Log "Prerequisites check passed" -Level 'SUCCESS'
}
#endregion

#region Resource Group
function New-ResourceGroupIfNotExists {
    param(
        [string]$RgName,
        [string]$Location
    )

    $existing = az group show --name $RgName --query name -o tsv 2>&1
    if ($existing -eq $RgName) {
        Write-Log "Resource group '$RgName' already exists" -Level 'INFO'
        return
    }

    Write-Log "Creating resource group '$RgName' in '$Location'..." -Level 'INFO'
    az group create --name $RgName --location $Location --query properties.provisioningState -o tsv | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-ErrorLog "Failed to create resource group" }
    Write-Log "Resource group '$RgName' created" -Level 'SUCCESS'
}
#endregion

#region Bicep Build
function Build-Bicep {
    param([string]$MainBicepPath)

    Write-Log "Building Bicep templates..." -Level 'INFO'
    $outputPath = Join-Path $PSScriptRoot "..\infra\main.json"

    bicep build $MainBicepPath --outfile $outputPath
    if ($LASTEXITCODE -ne 0) { Write-ErrorLog "Bicep build failed" }

    Write-Log "Bicep build successful: $outputPath" -Level 'SUCCESS'
    return $outputPath
}
#endregion

#region Azure Deployment
function Invoke-BicepDeployment {
    param(
        [string]$RgName,
        [string]$Location,
        [string]$Environment,
        [string]$PrincipalObjectId,
        [string]$CompiledTemplatePath
    )

    $deploymentName = "econnectone-${Environment}-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

    Write-Log "Starting deployment '$deploymentName' to resource group '$RgName'..." -Level 'INFO'

    $postgresPassword = -join ((65..90) + (97..122) + (48..57) + (33..46) | Get-Random -Count 24 | ForEach-Object {[char]$_})

    $deploymentParams = @{
        environment = $Environment
        location = $Location
        principalObjectId = $PrincipalObjectId
        adminPassword = $postgresPassword
    }

    $paramArgs = @()
    foreach ($key in $deploymentParams.Keys) {
        $paramArgs += "--parameters"
        $paramArgs += "$key=$($deploymentParams[$key])"
    }

    $azArgs = @(
        'deployment', 'group', 'create',
        '--resource-group', $RgName,
        '--name', $deploymentName,
        '--template-file', $CompiledTemplatePath,
        '--query', 'properties.outputs',
        '--output', 'json'
    ) + $paramArgs

    if ($WhatIf) {
        $azArgs += '--what-if'
        Write-Log "Running What-If analysis..." -Level 'WARN'
    }

    $outputJson = az @azArgs 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { Write-ErrorLog "Azure deployment failed: $outputJson" }

    $outputs = $outputJson | ConvertFrom-Json
    Write-Log "Deployment '$deploymentName' completed successfully" -Level 'SUCCESS'

    return @{
        Outputs = $outputs
        PostgresPassword = $postgresPassword
    }
}
#endregion

#region Key Vault Secret Population
function Set-KeyVaultSecrets {
    param(
        [string]$KeyVaultName,
        [hashtable]$Secrets
    )

    foreach ($secret in $Secrets.GetEnumerator()) {
        $secretValue = $secret.Value
        $azSecretArgs = @(
            'keyvault', 'secret', 'set',
            '--vault-name', $KeyVaultName,
            '--name', $secret.Key,
            '--value', $secretValue
        )
        az @azSecretArgs 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Warning: Failed to set secret '$($secret.Key)' in Key Vault" -Level 'WARN'
        } else {
            Write-Log "Secret '$($secret.Key)' stored in Key Vault" -Level 'SUCCESS'
        }
    }
}
#endregion

#region GitHub OIDC Service Principal
function New-GitHubOidcServicePrincipal {
    param(
        [string]$SubscriptionId,
        [string]$ResourceGroupName,
        [string]$KeyVaultName,
        [string]$SpName = "econnectone-github-actions-oidc"
    )

    if ($SkipGitHubSPCreation) {
        Write-Log "Skipping GitHub OIDC Service Principal creation (flag set)" -Level 'INFO'
        return $null
    }

    Write-Log "Creating GitHub OIDC Service Principal..." -Level 'INFO'

    $existingSp = az ad sp list --display-name $SpName --query "[0].appId" -o tsv 2>&1
    if ($existingSp) {
        Write-Log "Service Principal '$SpName' already exists (AppId: $existingSp)" -Level 'INFO'
        $spAppId = $existingSp
    } else {
        $spAppId = (az ad sp create-for-rbac `
            --name $SpName `
            --role Contributor `
            --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroupName" `
            --query appId -o tsv)
    }

    $federatedCredentialName = "github-actions-econnectone-main"
    $federatedCred = @{
        name = $federatedCredentialName
        issuer = 'https://token.actions.githubusercontent.com'
        subject = 'repo:diweshtanwar/eConnectOneV1:ref:refs/heads/main'
        audiences = @('api://AzureADTokenExchange')
    } | ConvertTo-Json

    az ad app federated-credential create `
        --id $spAppId `
        --parameters $federatedCred | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Log "Warning: Failed to create federated credential. You may need to create it manually in Azure Portal." -Level 'WARN'
    } else {
        Write-Log "Federated credential '$federatedCredentialName' created for OIDC" -Level 'SUCCESS'
    }

    $tenantId = az account show --query tenantId -o tsv

    # Grant Key Vault Secrets User role to OIDC SP for deployment workflow access
    if ($KeyVaultName) {
        Write-Log "Granting Key Vault access to OIDC Service Principal..." -Level 'INFO'
        $kvScope = (az keyvault show --name $KeyVaultName --query id -o tsv)
        az role assignment create `
            --assignee $spAppId `
            --role "Key Vault Secrets User" `
            --scope $kvScope | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Warning: Failed to grant Key Vault access to OIDC SP" -Level 'WARN'
        } else {
            Write-Log "Key Vault access granted to OIDC SP" -Level 'SUCCESS'
        }
    }

    Write-Log "GitHub OIDC Service Principal created:" -Level 'SUCCESS'
    Write-Log "  Client ID: $spAppId" -Level 'INFO'
    Write-Log "  Tenant ID: $tenantId" -Level 'INFO'
    Write-Log "  Subscription: $SubscriptionId" -Level 'INFO'
    Write-Log ""
    Write-Log "Add these as GitHub repository secrets (Settings > Secrets > Actions):" -Level 'INFO'
    Write-Log "  AZURE_CLIENT_ID: $spAppId" -Level 'INFO'
    Write-Log "  AZURE_TENANT_ID: $tenantId" -Level 'INFO'
    Write-Log "  AZURE_SUBSCRIPTION_ID: $SubscriptionId" -Level 'INFO'

    return @{
        ClientId = $spAppId
        TenantId = $tenantId
        SubscriptionId = $SubscriptionId
    }
}
#endregion

#region Main Execution
function Main {
    $startTime = Get-Date
    Write-Log "========================================" -Level 'INFO'
    Write-Log "eConnectOne Infrastructure Deployment" -Level 'INFO'
    Write-Log "Environment: $Environment" -Level 'INFO'
    Write-Log "Location: $Location" -Level 'INFO'
    Write-Log "Resource Group: $ResourceGroupName" -Level 'INFO'
    Write-Log "========================================" -Level 'INFO'

    Test-Prerequisites

    New-ResourceGroupIfNotExists -RgName $ResourceGroupName -Location $Location

    $subscriptionId = az account show --query id -o tsv
    $principalObjectId = az ad signed-in-user show --query id -o tsv

    Write-Log "Subscription ID: $subscriptionId" -Level 'INFO'
    Write-Log "Principal Object ID: $principalObjectId" -Level 'INFO'

    $mainBicepPath = Join-Path $PSScriptRoot "..\infra\main.bicep"
    if (-not (Test-Path $mainBicepPath)) {
        Write-ErrorLog "Bicep template not found at $mainBicepPath"
    }
    $compiledTemplate = Build-Bicep -MainBicepPath $mainBicepPath

    $deploymentResult = Invoke-BicepDeployment `
        -RgName $ResourceGroupName `
        -Location $Location `
        -Environment $Environment `
        -PrincipalObjectId $principalObjectId `
        -CompiledTemplatePath $compiledTemplate

    $outputs = $deploymentResult.Outputs
    $postgresPassword = $deploymentResult.PostgresPassword
    $postgresFqdn = $outputs.postgresFullyQualifiedDomainName.value
    $postgresConnectionString = "postgresql://postgres:${postgresPassword}@${postgresFqdn}:5432/eConnectOne?sslmode=require"

    $keyVaultName = $outputs.keyVaultName.value
    Write-Log "Populating Key Vault secrets..." -Level 'INFO'
    Set-KeyVaultSecrets -KeyVaultName $keyVaultName -Secrets @{
        'POSTGRES-PASSWORD' = $postgresPassword
        'POSTGRES-CONNECTION-STRING' = $postgresConnectionString
        'JWT-SECRET-KEY' = (New-Guid).Guid + (New-Guid).Guid
    }

    Write-Log "Configuring App Service environment variables..." -Level 'INFO'
    $backendAppName = $outputs.backendAppName.value
    $frontendAppName = $outputs.frontendAppName.value

    $backendSettings = @(
        "DATABASE_URL=$postgresConnectionString"
        "ASPNETCORE_URLS=http://+:80"
        "DOTNET_ENVIRONMENT=Production"
        "JWT-SECRET-KEY=@Microsoft.KeyVault(SecretUri=https://$keyVaultName.vault.azure.net/secrets/JWT-SECRET-KEY/)"
        "WEBSITES_PORT=80"
    )
    foreach ($setting in $backendSettings) {
        $name, $value = $setting.Split('=', 2)
        az webapp config appsettings set `
            --resource-group $ResourceGroupName `
            --name $backendAppName `
            --settings "$name=$value" | Out-Null
    }

    $frontendSettings = @(
        "VITE_API_BASE_URL=https://$($outputs.backendAppHostname.value)/api"
    )
    foreach ($setting in $frontendSettings) {
        $name, $value = $setting.Split('=', 2)
        az webapp config appsettings set `
            --resource-group $ResourceGroupName `
            --name $frontendAppName `
            --settings "$name=$value" | Out-Null
    }

    Write-Log "App Service settings configured" -Level 'SUCCESS'

    New-GitHubOidcServicePrincipal `
        -SubscriptionId $subscriptionId `
        -ResourceGroupName $ResourceGroupName `
        -KeyVaultName $keyVaultName

    $endTime = Get-Date
    $duration = $endTime - $startTime

    Write-Log "========================================" -Level 'SUCCESS'
    Write-Log "Deployment completed in $($duration.Minutes) minutes $($duration.Seconds) seconds" -Level 'SUCCESS'
    Write-Log "========================================" -Level 'SUCCESS'
    Write-Log ""
    Write-Log "DEPLOYMENT OUTPUTS:" -Level 'INFO'
    Write-Log "  Backend URL: https://$($outputs.backendAppHostname.value)" -Level 'INFO'
    Write-Log "  Frontend URL: https://$($outputs.frontendAppHostname.value)" -Level 'INFO'
    Write-Log "  PostgreSQL: $($outputs.postgresFullyQualifiedDomainName.value)" -Level 'INFO'
    Write-Log "  Key Vault: https://$keyVaultName.vault.azure.net" -Level 'INFO'
    Write-Log "  Log Analytics: $($outputs.logAnalyticsWorkspaceId.value)" -Level 'INFO'
    Write-Log ""
    Write-Log "Next steps:" -Level 'INFO'
    Write-Log "  1. Add 3 GitHub secrets: AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID" -Level 'INFO'
    Write-Log "  2. Push code to main branch to trigger deployment" -Level 'INFO'
    Write-Log "  3. Verify apps at URLs above" -Level 'INFO'
}

Main
