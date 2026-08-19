@description('ACR name (must be globally unique, lowercase, 5-50 chars)')
param acrName string

@description('Resource group location')
param location string = resourceGroup().location

@description('Enable admin user? (false = use Managed Identity only)')
param adminUserEnabled bool = false

resource acr 'Microsoft.ContainerRegistry/registries@2023-06-01-preview' = {
  name: acrName
  location: location
  sku: {
    name: 'F1'
  }
  properties: {
    adminUserEnabled: adminUserEnabled
    publicNetworkAccess: 'Enabled'
  }
}

output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
output acrResourceId string = acr.id
