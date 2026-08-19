@description('Container App name')
param containerAppName string

@description('Resource group location')
param location string = resourceGroup().location

@description('Docker container image name')
param containerImage string

@description('Container registry server URL')
param containerRegistryServer string

@description('CPU cores')
param cpuCores string = '0.5'

@description('Memory in GB (e.g. "1.0Gi")')
param memoryGb string = '1.0'

@description('Minimum replica count (0 = scale-to-zero)')
param minReplicas int = 0

@description('Maximum replica count')
param maxReplicas int = 1

@description('Ingress enabled?')
param ingressEnabled bool = true

@description('Ingress target port')
param ingressTargetPort int = 80

@description('Environment variables as key-value object')
param environmentVariables object = {}

@description('Secrets as key-value object')
param secrets object = {}

// Convert secrets object to array for Container App secrets config
var secretsArray = [for item in objectKeys(secrets): {
  name: toLower(replace(item, '_', '-'))
  value: secrets[item]
}]

// Convert env vars object to array
var envArray = [for key in objectKeys(environmentVariables): {
  name: key
  value: environmentVariables[key]
}]

resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'env-${containerAppName}'
  location: location
  properties: {}
}

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      secrets: secretsArray
      registries: [
        {
          server: containerRegistryServer
          identity: 'system'
        }
      ]
      activeRevisionsMode: 'Single'
      ingress: ingressEnabled ? {
        external: true
        targetPort: ingressTargetPort
        transport: 'Auto'
      } : null
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: containerImage
          resources: {
            cpu: json(cpuCores)
            memory: '${memoryGb}Gi'
          }
          env: envArray
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

output containerAppId string = containerApp.id
output containerAppName string = containerApp.name
output defaultHostname string = containerApp.properties.configuration.ingress.fqdn
output managedIdentityPrincipalId string = containerApp.identity.principalId
