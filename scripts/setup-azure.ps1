<#
.SYNOPSIS
  Azure Infrastructure Setup for eConnectOne
  
.DESCRIPTION
  This script sets up all required Azure resources for eConnectOne deployment:
  - Resource Group
  - Container Registry (ACR)
  - PostgreSQL Database
  - App Service Plan
  - App Services (Backend & Frontend)
  
.PARAMETER ResourceGroup
  Name of the Azure resource group
  
.PARAMETER Location
  Azure region (default: southeastasia for India)
  
.PARAMETER ACRName
  Name of the Container Registry
  
.PARAMETER PostgresServerName
  Name of the PostgreSQL server
  
.PARAMETER AppServicePlanName
  Name of the App Service Plan
  
.EXAMPLE
  .\scripts\setup-azure.ps1
  .\scripts\setup-azure.ps1 -Location "eastus"
#>

param(
    [string]$ResourceGroup = "rg-eConnectOne",
    [string]$Location = "southeastasia",
    [string]$ACRName = "econnectone",
    [string]$PostgresServerName = "econnectone-postgres",
    [string]$AppServicePlanName = "plan-econnectone",
    [string]$BackendAppName = "econnectone-backend",
    [string]$FrontendAppName = "econnectone-frontend"
)

function Check-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan
    
    if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
        Write-Error "❌ Azure CLI not found. Install from: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    }
    
    try {
        az account show | Out-Null
    }
    catch {
        Write-Host "⏳ You need to login to Azure first..."
        az login
    }
    
    Write-Host "✅ Prerequisites check passed" -ForegroundColor Green
}

function Create-ResourceGroup {
    Write-Host "📁 Creating Resource Group: $ResourceGroup in $Location" -ForegroundColor Cyan
    
    az group create `
        --name $ResourceGroup `
        --location $Location
    
    Write-Host "✅ Resource Group created" -ForegroundColor Green
}

function Create-ContainerRegistry {
    Write-Host "🐳 Creating Container Registry: $ACRName" -ForegroundColor Cyan
    
    az acr create `
        --resource-group $ResourceGroup `
        --name $ACRName `
        --sku Basic `
        --admin-enabled true
    
    Write-Host "✅ Container Registry created" -ForegroundColor Green
}

function Create-PostgresDatabase {
    Write-Host "🗄️  Creating PostgreSQL Database" -ForegroundColor Cyan
    
    # Generate a secure password
    $postgresPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object {[char]$_})
    $postgresPassword += "!@#"
    
    Write-Host "⏳ This may take 5-10 minutes..." -ForegroundColor Yellow
    
    az postgres server create `
        --resource-group $ResourceGroup `
        --name $PostgresServerName `
        --location $Location `
        --admin-user postgres `
        --admin-password $postgresPassword `
        --sku-name B_Gen5_1 `
        --storage-size 51200
    
    # Allow all IPs (for testing; restrict in production)
    az postgres server firewall-rule create `
        --resource-group $ResourceGroup `
        --server-name $PostgresServerName `
        --name AllowAllIps `
        --start-ip-address 0.0.0.0 `
        --end-ip-address 255.255.255.255
    
    # Create database
    az postgres db create `
        --resource-group $ResourceGroup `
        --server-name $PostgresServerName `
        --name eConnectOne
    
    Write-Host "✅ PostgreSQL Database created" -ForegroundColor Green
    Write-Host "📝 Save this password securely: $postgresPassword" -ForegroundColor Yellow
    Write-Host "   You'll need it for GitHub Secrets (POSTGRES_PASSWORD)" -ForegroundColor Yellow
    
    return $postgresPassword
}

function Create-AppServicePlan {
    Write-Host "📋 Creating App Service Plan: $AppServicePlanName" -ForegroundColor Cyan
    
    # Try B1 free tier first, fallback to B1 if not available
    az appservice plan create `
        --name $AppServicePlanName `
        --resource-group $ResourceGroup `
        --sku B1 `
        --is-linux
    
    Write-Host "✅ App Service Plan created (B1: ~$10/month)" -ForegroundColor Green
}

function Create-AppServices {
    Write-Host "🚀 Creating App Services" -ForegroundColor Cyan
    
    # Backend App Service
    Write-Host "  Creating backend app: $BackendAppName" -ForegroundColor Cyan
    az webapp create `
        --resource-group $ResourceGroup `
        --plan $AppServicePlanName `
        --name $BackendAppName `
        --deployment-container-image-name "mcr.microsoft.com/dotnet/samples:aspnetapp"
    
    # Frontend App Service
    Write-Host "  Creating frontend app: $FrontendAppName" -ForegroundColor Cyan
    az webapp create `
        --resource-group $ResourceGroup `
        --plan $AppServicePlanName `
        --name $FrontendAppName `
        --deployment-container-image-name "nginx:latest"
    
    Write-Host "✅ App Services created" -ForegroundColor Green
}

function Get-Credentials {
    Write-Host "🔑 Retrieving credentials for GitHub Secrets" -ForegroundColor Cyan
    
    # Get ACR Credentials
    $acrCreds = az acr credential show `
        --name $ACRName `
        --resource-group $ResourceGroup `
        --query "{username: username, password: passwords[0].value}" `
        -o json | ConvertFrom-Json
    
    # Get Azure Subscription ID
    $subscriptionId = az account show --query id -o tsv
    
    # Get PostgreSQL Connection Info
    $postgresHostName = az postgres server show `
        --resource-group $ResourceGroup `
        --name $PostgresServerName `
        --query fullyQualifiedDomainName -o tsv
    
    Write-Host "`n📋 GITHUB SECRETS - Add these to your repository:" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "AZURE_SUBSCRIPTION_ID: $subscriptionId"
    Write-Host "AZURE_RESOURCE_GROUP: $ResourceGroup"
    Write-Host "ACR_NAME: $ACRName"
    Write-Host "ACR_USERNAME: $($acrCreds.username)"
    Write-Host "ACR_PASSWORD: $($acrCreds.password)"
    Write-Host "BACKEND_APP_NAME: $BackendAppName"
    Write-Host "FRONTEND_APP_NAME: $FrontendAppName"
    Write-Host "POSTGRES_PASSWORD: <Enter the password from PostgreSQL creation step>"
    Write-Host "================================`n" -ForegroundColor Cyan
    
    Write-Host "⚠️  Also create AZURE_CREDENTIALS secret:" -ForegroundColor Yellow
    Write-Host "   1. Create a Service Principal:" -ForegroundColor Yellow
    Write-Host "      az ad sp create-for-rbac --name econnectone-github-action --role Contributor --scopes /subscriptions/$subscriptionId" -ForegroundColor Gray
    Write-Host "   2. Copy the JSON output and add as AZURE_CREDENTIALS secret" -ForegroundColor Yellow
    
    Write-Host "`n📌 PostgreSQL Connection String (for App Service config):" -ForegroundColor Green
    Write-Host "postgresql://postgres:YOURPASSWORD@$postgresHostName:5432/eConnectOne?sslmode=require" -ForegroundColor Gray
}

function Main {
    Write-Host "🚀 eConnectOne Azure Infrastructure Setup" -ForegroundColor Cyan
    Write-Host "=========================================`n" -ForegroundColor Cyan
    
    Write-Host "Configuration:" -ForegroundColor Cyan
    Write-Host "  Resource Group: $ResourceGroup"
    Write-Host "  Location: $Location"
    Write-Host "  Container Registry: $ACRName"
    Write-Host "  PostgreSQL: $PostgresServerName"
    Write-Host "  Backend App: $BackendAppName"
    Write-Host "  Frontend App: $FrontendAppName`n" -ForegroundColor Gray
    
    $proceed = Read-Host "Continue with setup? (yes/no)"
    if ($proceed -ne "yes") {
        Write-Host "❌ Setup cancelled" -ForegroundColor Red
        exit 0
    }
    
    Check-Prerequisites
    Create-ResourceGroup
    Create-ContainerRegistry
    
    $postgresPassword = Create-PostgresDatabase
    Create-AppServicePlan
    Create-AppServices
    Get-Credentials
    
    Write-Host "✅ Azure infrastructure setup complete!" -ForegroundColor Green
    Write-Host "`n📚 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Copy the GitHub Secrets from above into your repository settings"
    Write-Host "  2. Create Azure Service Principal and add AZURE_CREDENTIALS secret"
    Write-Host "  3. Configure App Service environment variables"
    Write-Host "  4. Push code to 'main' branch to trigger GitHub Actions deployment" -ForegroundColor Gray
}

Main
