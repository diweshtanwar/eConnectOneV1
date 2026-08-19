@description('Deployment environment: dev | staging | prod')
param environment string = 'dev'

@description('Location for all resources')
param location string = 'southeastasia'

@description('GitHub repository owner')
param repoOwner string = 'diweshtanwar'

@description('GitHub repository name')
param repoName string = 'eConnectOneV1'

@description('GitHub branch for deployment')
param branch string = 'main'

@description('Neon.tech PostgreSQL connection string')
@secure()
param neonConnectionString string

@description('JWT secret key')
@secure()
param jwtSecretKey string

// --- Container Registry ---
module acrModule 'modules/containerregistry.bicep' = {
  name: 'acr-${environment}'
  params: {
    acrName: 'creconnectone${environment}'
    location: location
    adminUserEnabled: false
  }
}

// --- Backend Container App ---
module backendAppModule 'modules/container-app.bicep' = {
  name: 'backend-${environment}'
  params: {
    containerAppName: 'app-econnectone-api-${environment}'
    location: location
    containerImage: '${acrModule.outputs.acrLoginServer}/econnectone-backend:latest'
    containerRegistryServer: acrModule.outputs.acrLoginServer
    cpuCores: 0.5
    memoryGb: 1.0
    minReplicas: 0
    maxReplicas: 1
    ingressEnabled: true
    ingressTargetPort: 10000
    environmentVariables: {
      'DOTNET_ENVIRONMENT': 'Production'
      'DATABASE_URL': neonConnectionString
      'JWT-SECRET-KEY': jwtSecretKey
      'ASPNETCORE_URLS': 'http://+:10000'
    }
    secrets: {
      'DATABASE_URL': neonConnectionString
      'JWT-SECRET-KEY': jwtSecretKey
    }
  }
  dependsOn: [
    acrModule
  ]
}

// --- Frontend Static Web App ---
module frontendAppModule 'modules/static-web-app.bicep' = {
  name: 'frontend-${environment}'
  params: {
    staticWebAppName: 'app-econnectone-web-${environment}'
    location: location
    repoOwner: repoOwner
    repoName: repoName
    branch: branch
    appLocation: '/'
    outputLocation: 'frontend/dist'
    skipGitHubWorkflow: true
  }
}

// Outputs
output resourceGroupName string = resourceGroup().name
output location string = location
output acrLoginServer string = acrModule.outputs.acrLoginServer
output acrName string = acrModule.outputs.acrName
output backendAppName string = backendAppModule.outputs.containerAppName
output backendAppHostname string = backendAppModule.outputs.defaultHostname
output frontendAppName string = frontendAppModule.outputs.staticWebAppName
output frontendAppHostname string = frontendAppModule.outputs.defaultHostname
output backendManagedIdentityPrincipalId string = backendAppModule.outputs.managedIdentityPrincipalId
