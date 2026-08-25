@description('Deployment environment: dev | staging | prod')
param environment string = 'dev'

@description('Short unique suffix to avoid global name collisions')
param uniqueSuffix string = 'ec1'

@description('Location for all resources')
param location string = 'southeastasia'

@description('PostgreSQL administrator password')
@secure()
param postgresAdminPassword string

@description('JWT secret key')
@secure()
param jwtSecretKey string

@description('Object ID of the GitHub Actions service principal')
param deployPrincipalObjectId string = ''

// --- Container Registry ---
module acrModule 'modules/containerregistry.bicep' = {
  name: 'acr-${environment}'
  params: {
    acrName: 'acreconn${environment}${uniqueSuffix}'
    location: location
    adminUserEnabled: true
  }
}

// --- Azure PostgreSQL Flexible Server ---
module postgresModule 'modules/postgres.bicep' = {
  name: 'postgres-${environment}'
  params: {
    postgresServerName: 'pg-econn-${environment}-${uniqueSuffix}'
    location: location
    adminUser: 'pgadmin'
    adminPassword: postgresAdminPassword
    postgresVersion: '16'
    skuName: 'Standard_B1ms'
    storageSize: 32768
    databaseName: 'eConnectOne'
  }
}

var dbConnectionString = 'Host=${postgresModule.outputs.postgresFullyQualifiedDomainName};Port=5432;Database=eConnectOne;Username=pgadmin;Password=${postgresAdminPassword};SSL Mode=Require'

// --- Key Vault ---
module kvModule 'modules/keyvault.bicep' = {
  name: 'kv-${environment}'
  params: {
    keyVaultName: 'kv-econn-${environment}-${uniqueSuffix}'
    location: location
    principalObjectId: deployPrincipalObjectId
    enablePurgeProtection: true
  }
}

resource kvSecretDb 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: 'kv-econn-${environment}-${uniqueSuffix}/DATABASE-URL'
  properties: { value: dbConnectionString }
  dependsOn: [kvModule]
}

resource kvSecretJwt 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: 'kv-econn-${environment}-${uniqueSuffix}/JWT-SECRET-KEY'
  properties: { value: jwtSecretKey }
  dependsOn: [kvModule]
}

// --- Shared Container App Environment (1 per region limit) ---
resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'env-econnectone-${environment}'
  location: location
  properties: {}
}

// --- Application Container App (serves both API and frontend from one image) ---
module appModule 'modules/container-app.bicep' = {
  name: 'app-${environment}'
  params: {
    containerAppName: 'app-econnectone-${environment}'
    location: location
    containerAppEnvId: containerAppEnv.id
    containerImage: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
    containerRegistryServer: ''
    cpuCores: '0.5'
    memoryGb: '1.0'
    minReplicas: 0
    maxReplicas: 1
    ingressEnabled: true
    ingressTargetPort: 80
    environmentVariables: {
      DOTNET_ENVIRONMENT: 'Production'
      ASPNETCORE_URLS: 'http://+:80'
    }
    secrets: {
      DATABASE_URL: dbConnectionString
      'JWT-SECRET-KEY': jwtSecretKey
    }
  }
}

// --- Grant app managed identity Key Vault access ---
var kvRoleAppName = guid('kv-econn-${environment}-${uniqueSuffix}', 'app-econnectone-${environment}', 'kvSecretsUser')
resource kvRoleApp 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: kvRoleAppName
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: appModule.outputs.managedIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output acrLoginServer string = acrModule.outputs.acrLoginServer
output acrName string = acrModule.outputs.acrName
output appHostname string = appModule.outputs.defaultHostname
output appName string = appModule.outputs.containerAppName
output keyVaultName string = kvModule.outputs.keyVaultName
