@description('App Service Plan name')
param planName string

@description('Resource group location')
param location string = resourceGroup().location

@description('SKU (B1: Basic 1, S1: Standard 1, P1v3: Premium v3)')
@allowed([
  'B1'
  'B2'
  'B3'
  'S1'
  'S2'
  'S3'
  'P1v3'
  'P2v3'
  'P3v3'
])
param skuName string = 'B1'

@description('Maximum number of workers for scaling')
param maximumElasticWorkerCount int = 10

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  sku: {
    name: skuName
    tier: toLower(skuName) == 'b1' || toLower(skuName) == 'b2' || toLower(skuName) == 'b3' ? 'Basic' : 'Standard'
    capacity: maximumElasticWorkerCount
  }
  kind: 'linux'
  properties: {
    reserved: true
    isXenon: false
    hyperV: false
    targetWorkerCount: 0
    targetWorkerSizeId: 0
  }
}

output planId string = plan.id
output planName string = plan.name
