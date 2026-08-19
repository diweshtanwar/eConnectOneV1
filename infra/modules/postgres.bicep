@description('PostgreSQL server name (globally unique)')
param postgresServerName string

@description('Resource group location')
param location string = resourceGroup().location

@description('Administrator username')
param adminUser string = 'postgres'

@description('Administrator password (from Key Vault reference or parameter)')
@secure()
param adminPassword string

@description('PostgreSQL version')
@allowed([
  '14'
  '15'
  '16'
])
param postgresVersion string = '16'

@description('SKU name (e.g., B_Gen5_1, GP_Gen5_2, MO_Gen5_2)')
param skuName string = 'B_Gen5_1'

@description('Storage in MB (min 32768, max 16777216)')
@minValue(32768)
param storageSize int = 51200

@description('Backup retention days')
@minValue(7)
@maxValue(35)
param backupRetentionDays int = 7

@description('Geo-redundant backup?')
param geoRedundantBackup bool = false

@description('VNet integration subnet resource ID (optional)')
param subnetId string = ''

@description('PostgreSQL database name')
param databaseName string = 'eConnectOne'

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: postgresServerName
  location: location
  properties: {
    administratorLogin: adminUser
    administratorLoginPassword: adminPassword
    version: postgresVersion
    sku: {
      name: skuName
      tier: 'Burstable'
    }
    storage: {
      storageSizeGB: storageSize / 1024
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: backupRetentionDays
      geoRedundantBackup: geoRedundantBackup
    }
    network: {
      delegatedSubnetResourceId: subnetId
      privateDnsZoneArmResourceId: string(subnetId != '' ? '${resourceGroup().id}/providers/Microsoft.Network/privateDnsZones/privatelink.postgres.database.azure.com' : '')
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource postgresFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource postgresDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-06-01-preview' = {
  parent: postgresServer
  name: databaseName
  properties: {}
}

output postgresFullyQualifiedDomainName string = postgresServer.properties.fullyQualifiedDomainName
output postgresServerId string = postgresServer.id
