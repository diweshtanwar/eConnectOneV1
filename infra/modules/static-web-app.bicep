@description('Static Web App name')
param staticWebAppName string

@description('Resource group location')
param location string = resourceGroup().location

@description('Repository owner (GitHub user or org)')
param repoOwner string

@description('Repository name')
param repoName string

@description('Branch to deploy from')
param branch string = 'main'

@description('App location (frontend source folder)')
param appLocation string = '/'

@description('API location (backend folder, if any)')
param apiLocation string = ''

@description('Output location (frontend build output folder)')
param outputLocation string = 'dist'

@description('Skip GitHub Actions workflow creation?')
param skipGitHubWorkflow bool = false

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
  }
  properties: {
    repositoryUrl: 'https://github.com/${repoOwner}/${repoName}'
    branch: branch
    repositoryToken: ''
    isHttpsEnabled: true
    isApiApp: false
    skipGitHubWorkflowCreation: skipGitHubWorkflow
    appSettings: {}
  }
}

output staticWebAppId string = staticWebApp.id
output staticWebAppName string = staticWebApp.name
output defaultHostname string = staticWebApp.properties.defaultHostname
