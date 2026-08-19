@description('App Service name')
param appName string

@description('App Service Plan resource ID')
param appServicePlanId string

@description('Resource group location')
param location string = resourceGroup().location

@description('Docker container image name (e.g., mcr.microsoft.com/dotnet/aspnet:9.0)')
param containerImage string

@description('Container registry URL (e.g., myregistry.azurecr.io)')
param acrLoginServer string

@description('Container registry resource ID (for AcrPull role assignment)')
param acrResourceId string = ''

@description('Enable managed identity?')
param managedIdentityEnabled bool = true

@description('App Insights instrumentation key (optional)')
param appInsightsInstrumentationKey string = ''

@description('Key Vault URL for secret references')
param keyVaultUri string = ''

resource app 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  kind: 'app,linux,container'
  identity: managedIdentityEnabled ? {
    type: 'SystemAssigned'
  } : null
  properties: {
    serverFarmId: appServicePlanId
    siteConfig: {
      linuxFxVersion: 'DOCKER|${containerImage}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: managedIdentityEnabled ? app.identity.principalId : ''
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${acrLoginServer}'
        }
        {
          name: 'DOCKER_ENABLE_CI'
          value: 'true'
        }
      ]
    }
    httpsOnly: true
    clientAffinityEnabled: false
  }
}

// Assign AcrPull role to the App Service's managed identity
resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (managedIdentityEnabled && acrResourceId != '') {
  name: guid(appName, acrResourceId, 'acrpull')
  scope: acrResourceId
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4b3d-49d0-ad49-04a06047f744')
    principalId: app.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

output appId string = app.id
output appName string = app.name
output defaultHostname string = app.properties.defaultHostname
output managedIdentityPrincipalId string = managedIdentityEnabled ? app.identity.principalId : ''
