@description('Key Vault name')
param keyVaultName string

@description('Resource group location')
param location string = resourceGroup().location

@description('Object ID of the deploying principal for RBAC')
param principalObjectId string

@description('Tenant ID')
param tenantId string = subscription().tenantId

@description('Enable purge protection?')
param enablePurgeProtection bool = false

@description('Enable soft-delete retention days')
@minValue(7)
@maxValue(90)
param softDeleteRetentionDays int = 90

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: tenantId
    sku: {
      name: 'standard'
      family: 'A'
    }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: softDeleteRetentionDays
    enablePurgeProtection: enablePurgeProtection
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Deny'
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}

resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVaultName, principalObjectId, 'keyVaultSecretsOfficer')
  scope: kv
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: principalObjectId
    principalType: 'ServicePrincipal'
  }
}

output keyVaultUri string = kv.properties.vaultUri
output keyVaultName string = kv.name
