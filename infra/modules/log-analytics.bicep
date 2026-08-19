@description('Log Analytics workspace name')
param workspaceName string

@description('Resource group location')
param location string = resourceGroup().location

@description('Retention period in days')
@minValue(30)
@maxValue(730)
param retentionInDays int = 30

resource workspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: workspaceName
  location: location
  properties: {
    retentionInDays: retentionInDays
    features: {
      searchVersion: 1
    }
    sku: {
      name: 'PerGB2018'
    }
  }
}

output workspaceId string = workspace.id
output workspaceName string = workspace.name
output customerId string = workspace.customerId
