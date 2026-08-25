<#
.SYNOPSIS
  One-time cleanup tool for legacy eConnectOne Azure resources
.DESCRIPTION
  Finds and optionally deletes Azure resources left over from the previous
  two-container architecture:
    - Container Apps: app-econnectone-api-{env}, app-econnectone-web-{env}
    - ACR repositories: econnectone-backend, econnectone-frontend

  This is a manual ONE-TIME cleanup script only. It is intentionally not part
  of CI/CD because resource deletion should never happen automatically.
.EXAMPLE
  .\scripts\Cleanup-OldAzureResources.ps1 -Environment prod
.EXAMPLE
  .\scripts\Cleanup-OldAzureResources.ps1 -Environment prod -WhatIf -SkipConfirmation
#>

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment = 'prod',

    [Parameter(Mandatory = $false)]
    [string]$ResourceGroupName = "rg-econnectone-$Environment",

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
    $LogFile = Join-Path $LogDir "cleanup-old-azure-resources-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
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

    $cmd = Get-Command az -ErrorAction SilentlyContinue
    if (-not $cmd) {
        Write-ErrorLog "Azure CLI not found. Please install it first."
    }
    Write-Log "Found Azure CLI: $($cmd.Source)" -Level 'SUCCESS'

    if ($WhatIfPreference) {
        if (Test-AzCliAuthenticated) {
            Write-Log "Azure CLI is authenticated (live resource discovery available during WhatIf)" -Level 'SUCCESS'
        } else {
            Write-Log "Azure CLI is not authenticated. WhatIf mode will use expected resource names only." -Level 'WARN'
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

#region Azure Discovery
function Confirm-Deletion {
    param(
        [Parameter(Mandatory)][string]$Prompt,
        [Parameter(Mandatory)][string[]]$Items
    )

    foreach ($item in $Items) {
        Write-Log "  - $item" -Level 'INFO'
    }

    if ($WhatIfPreference) {
        Write-Log "WhatIf mode enabled. No delete commands will be executed." -Level 'WARN'
        return $false
    }

    if ($SkipConfirmation) {
        Write-Log "Skipping confirmation prompt (flag set)" -Level 'WARN'
        return $true
    }

    $confirmation = Read-Host $Prompt
    return $confirmation -ceq 'YES'
}

function Resolve-AcrName {
    param([Parameter(Mandatory)][bool]$CanQueryAzure)

    $defaultAcrName = "acreconn${Environment}ec1"
    if (-not $CanQueryAzure) {
        Write-Log "Using expected ACR name '$defaultAcrName' (live Azure lookup skipped)." -Level 'WARN'
        return $defaultAcrName
    }

    $acrNames = Invoke-AzLines -Arguments @('acr', 'list', '--resource-group', $ResourceGroupName, '--query', '[].name', '-o', 'tsv')
    $matches = @($acrNames | Where-Object { $_ -like "acreconn${Environment}*" })

    if ($matches.Count -eq 0) {
        Write-Log "No Azure Container Registry found in '$ResourceGroupName' matching 'acreconn${Environment}*'." -Level 'WARN'
        return $null
    }

    if ($matches -contains $defaultAcrName) {
        Write-Log "Resolved ACR: $defaultAcrName" -Level 'SUCCESS'
        return $defaultAcrName
    }

    if ($matches.Count -eq 1) {
        Write-Log "Resolved ACR: $($matches[0])" -Level 'SUCCESS'
        return $matches[0]
    }

    Write-ErrorLog "Multiple ACR instances matched 'acreconn${Environment}*': $($matches -join ', ')."
}

function Get-ExistingLegacyContainerApps {
    param([Parameter(Mandatory)][bool]$CanQueryAzure)

    $expectedNames = @(
        "app-econnectone-api-$Environment",
        "app-econnectone-web-$Environment"
    )

    if (-not $CanQueryAzure) {
        return $expectedNames
    }

    $containerApps = Invoke-AzLines -Arguments @('containerapp', 'list', '--resource-group', $ResourceGroupName, '--query', '[].name', '-o', 'tsv')
    return @($expectedNames | Where-Object { $containerApps -contains $_ })
}

function Get-ExistingLegacyRepositories {
    param(
        [string]$AcrName,
        [Parameter(Mandatory)][bool]$CanQueryAzure
    )

    $expectedRepositories = @(
        'econnectone-backend',
        'econnectone-frontend'
    )

    if (-not $CanQueryAzure) {
        return $expectedRepositories
    }

    if ([string]::IsNullOrWhiteSpace($AcrName)) {
        return @()
    }

    $repositories = Invoke-AzLines -Arguments @('acr', 'repository', 'list', '--name', $AcrName, '-o', 'tsv') -AllowFailure
    return @($expectedRepositories | Where-Object { $repositories -contains $_ })
}
#endregion

#region Deletion
function Remove-LegacyContainerApps {
    param([Parameter(Mandatory)][string[]]$ContainerApps)

    foreach ($appName in $ContainerApps) {
        if ($WhatIfPreference) {
            Write-Log "WhatIf: Would delete Container App '$appName' from resource group '$ResourceGroupName'." -Level 'WARN'
            continue
        }

        Write-Log "Deleting Container App '$appName'..." -Level 'INFO'
        az containerapp delete --resource-group $ResourceGroupName --name $appName --yes | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorLog "Failed to delete Container App '$appName'."
        }

        Write-Log "Deleted Container App '$appName'" -Level 'SUCCESS'
    }
}

function Remove-LegacyRepositories {
    param(
        [Parameter(Mandatory)][string]$AcrName,
        [Parameter(Mandatory)][string[]]$Repositories
    )

    foreach ($repository in $Repositories) {
        if ($WhatIfPreference) {
            Write-Log "WhatIf: Would delete ACR repository '$repository' from registry '$AcrName'." -Level 'WARN'
            continue
        }

        Write-Log "Deleting ACR repository '$repository' from '$AcrName'..." -Level 'INFO'
        az acr repository delete --name $AcrName --repository $repository --yes | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorLog "Failed to delete ACR repository '$repository'."
        }

        Write-Log "Deleted ACR repository '$repository'" -Level 'SUCCESS'
    }
}
#endregion

#region Main
function Main {
    $startTime = Get-Date

    Write-Log "========================================" -Level 'INFO'
    Write-Log "eConnectOne Legacy Azure Resource Cleanup" -Level 'INFO'
    Write-Log "Environment: $Environment" -Level 'INFO'
    Write-Log "Resource Group: $ResourceGroupName" -Level 'INFO'
    Write-Log "========================================" -Level 'INFO'

    Test-Prerequisites

    $canQueryAzure = Test-AzCliAuthenticated
    if ($canQueryAzure) {
        $existingResourceGroup = Invoke-AzText -Arguments @('group', 'show', '--name', $ResourceGroupName, '--query', 'name', '-o', 'tsv') -AllowFailure
        if ($existingResourceGroup -ne $ResourceGroupName) {
            Write-ErrorLog "Resource group '$ResourceGroupName' not found."
        }
        Write-Log "Resource group '$ResourceGroupName' found" -Level 'SUCCESS'
    } else {
        Write-Log "Skipping live resource group lookup because Azure CLI is not authenticated." -Level 'WARN'
    }

    $legacyApps = Get-ExistingLegacyContainerApps -CanQueryAzure $canQueryAzure
    $acrName = Resolve-AcrName -CanQueryAzure $canQueryAzure
    $legacyRepositories = Get-ExistingLegacyRepositories -AcrName $acrName -CanQueryAzure $canQueryAzure

    if ($legacyApps.Count -eq 0) {
        Write-Log "No legacy two-container Container Apps were found." -Level 'SUCCESS'
    } else {
        if ($WhatIfPreference -and -not $canQueryAzure) {
            Write-Log "Legacy Container App names that would be checked:" -Level 'WARN'
        } else {
            Write-Log "Legacy Container Apps identified:" -Level 'WARN'
        }
        $deleteApps = Confirm-Deletion -Prompt "Type YES to delete the listed legacy Container Apps" -Items $legacyApps
        if ($deleteApps) {
            Remove-LegacyContainerApps -ContainerApps $legacyApps
        } elseif (-not $WhatIfPreference) {
            Write-Log "Skipped Container App deletion." -Level 'WARN'
        }
    }

    if ($legacyRepositories.Count -eq 0) {
        Write-Log "No legacy ACR repositories were found." -Level 'SUCCESS'
    } else {
        if ($WhatIfPreference -and -not $canQueryAzure) {
            Write-Log "Legacy ACR repositories that would be checked in '$acrName':" -Level 'WARN'
        } else {
            Write-Log "Legacy ACR repositories identified in '$acrName':" -Level 'WARN'
        }
        $deleteRepositories = Confirm-Deletion -Prompt "Type YES to delete the listed legacy ACR repositories" -Items $legacyRepositories
        if ($deleteRepositories) {
            Remove-LegacyRepositories -AcrName $acrName -Repositories $legacyRepositories
        } elseif (-not $WhatIfPreference) {
            Write-Log "Skipped ACR repository deletion." -Level 'WARN'
        }
    }

    if ($WhatIfPreference -and -not $canQueryAzure) {
        Write-Log "WhatIf completed using expected names only. Authenticate Azure CLI to perform live discovery." -Level 'WARN'
    }

    $endTime = Get-Date
    $duration = $endTime - $startTime
    Write-Log "Operation completed in $($duration.Minutes) minutes $($duration.Seconds) seconds" -Level 'SUCCESS'
}

Main
#endregion
