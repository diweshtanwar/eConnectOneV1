@description('Container App name')
param containerAppName string

@description('Resource group location')
param location string = resourceGroup().location

@description('Container App environment resource ID (optional)')
param containerAppEnvironmentId string = ''

@description('Docker container image name (e.g., myregistry.azurecr.io/myapp:tag)')
param containerImage string

@description('Container registry server URL (e.g., myregistry.azurecr.io)')
param containerRegistryServer string

@description('Container registry username (empty for managed identity)')
param containerRegistryUsername string = ''

@description('Container registry password (empty for managed identity)')
param containerRegistryPassword string = ''

@description('CPU cores')
@minValue(0.1)
@maxValue(4)
param cpuCores float = '0.5'

@description('Memory in GB')
@minValue(0.5)
@maxValue(16)
param memoryGb float = '1.0'

@description('Minimum replica count (0 for scale-to-zero)')
param minReplicas int = 0

@description('Maximum replica count')
param maxReplicas int = 1

@description('Environment variables as key-value pairs')
param environmentVariables object = {}

@description('Secrets as key-value pairs (stored in Container App secrets)')
param secrets object = {}

@description('Ingress enabled?')
param ingressEnabled bool = true

@description('Ingress target port')
param ingressTargetPort int = 80

@description('Enable managed identity?')
param managedIdentityEnabled bool = true

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerAppName
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironmentId
    configuration: {
      secrets: [
        for secret in secrets: {
          name: secret.key
          value: secret.value
        }
      ]
      registries: [
        {
          server: containerRegistryServer
          username: containerRegistryUsername
          passwordSecretRef: containerRegistryUsername == '' ? '' : 'acr-password'
        }
      ]
      activeRevisionsMode: 'Single'
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: containerImage
          resources: {
            cpu: cpuCores
            memory: memoryGb
          }
          env: [
            {
              name: key
              value: environmentVariables[key]
            }
            for key in environmentVariables
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
    ingress: ingressEnabled ? {
      external: true
      targetPort: ingressTargetPort
      transport: 'Auto'
    } : null
    identity: managedIdentityEnabled ? {
      type: 'SystemAssigned'
    } : null
  }
}

output containerAppId string = containerApp.id
output containerAppName string = containerApp.name
output defaultHostname string = containerApp.properties.ingress.fqdn
output managedIdentityPrincipalId string = managedIdentityEnabled ? containerApp.identity.principalId : ''
