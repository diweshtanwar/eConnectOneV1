@description('Deployment environment: dev | staging | prod')
param environment string = 'dev'

@description('Short unique suffix to avoid global name collisions (2-6 lowercase chars, e.g. your initials)')
param uniqueSuffix string = 'ec1'

@description('Location for all resources')
param location string = 'southeastasia'

@description('PostgreSQL administrator password')
@secure()
param postgresAdminPassword string

@description('JWT secret key')
@secure()
param jwtSecretKey string

@description('Object ID of the GitHub Actions service principal (for Key Vault secret write during deploy)')
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

// Connection string — SSL without skipping cert validation
var dbConnectionString = 'Host=${postgresModule.outputs.postgresFullyQualifiedDomainName};Port=5432;Database=eConnectOne;Username=pgadmin;Password=${postgresAdminPassword};SSL Mode=Require'

// --- Key Vault ---
module kvModule 'modules/keyvault.bicep' = {
  name: 'kv-${environment}'
  params: {
    keyVaultName: 'kv-econn-${environment}-${uniqueSuffix}'
    location: location
    principalObjectId: deployPrincipalObjectId
    enablePurgeProtection: false
  }
}

// Store secrets in Key Vault
resource kvSecretDb 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: 'kv-econn-${environment}-${uniqueSuffix}/DATABASE-URL'
  properties: {
    value: dbConnectionString
  }
  dependsOn: [kvModule]
}

resource kvSecretJwt 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: 'kv-econn-${environment}-${uniqueSuffix}/JWT-SECRET-KEY'
  properties: {
    value: jwtSecretKey
  }
  dependsOn: [kvModule]
}

// --- Backend Container App ---
module backendAppModule 'modules/container-app.bicep' = {
  name: 'backend-${environment}'
  params: {
    containerAppName: 'app-econnectone-api-${environment}'
    location: location
    containerImage: '${acrModule.outputs.acrLoginServer}/econnectone-backend:latest'
    containerRegistryServer: acrModule.outputs.acrLoginServer
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

// Grant backend managed identity access to Key Vault secrets
var kvRoleBackendName = guid('kv-econn-${environment}-${uniqueSuffix}', 'app-econnectone-api-${environment}', 'kvSecretsUser')
resource kvRoleBackend 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: kvRoleBackendName
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: backendAppModule.outputs.managedIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// --- Frontend Container App ---
module frontendAppModule 'modules/container-app.bicep' = {
  name: 'frontend-${environment}'
  params: {
    containerAppName: 'app-econnectone-web-${environment}'
    location: location
    containerImage: '${acrModule.outputs.acrLoginServer}/econnectone-frontend:latest'
    containerRegistryServer: acrModule.outputs.acrLoginServer
    cpuCores: '0.25'
    memoryGb: '0.5'
    minReplicas: 0
    maxReplicas: 1
    ingressEnabled: true
    ingressTargetPort: 80
    environmentVariables: {}
    secrets: {}
  }
}

// Outputs consumed by GitHub Actions
output acrLoginServer string = acrModule.outputs.acrLoginServer
output acrName string = acrModule.outputs.acrName
output backendHostname string = backendAppModule.outputs.defaultHostname
output frontendHostname string = frontendAppModule.outputs.defaultHostname
output backendAppName string = backendAppModule.outputs.containerAppName
output frontendAppName string = frontendAppModule.outputs.containerAppName
output keyVaultName string = kvModule.outputs.keyVaultName
// NOTE: dbConnectionString is intentionally NOT output here to avoid leaking in logs
// The workflow reconstructs it from secrets directly
