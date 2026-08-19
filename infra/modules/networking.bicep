@description('Virtual network name')
param vnetName string

@description('Subnet name for App Service VNet integration / PostgreSQL')
param subnetName string

@description('Resource group location')
param location string = resourceGroup().location

@description('Virtual network address prefix')
param vnetAddressPrefix string = '10.0.0.0/16'

@description('Subnet address prefix')
param subnetAddressPrefix string = '10.0.1.0/24'

resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        vnetAddressPrefix
      ]
    }
  }
}

resource subnet 'Microsoft.Network/virtualNetworks/subnets@2023-09-01' = {
  parent: vnet
  name: subnetName
  properties: {
    addressPrefix: subnetAddressPrefix
    delegations: [
      {
        name: 'Microsoft.DBforPostgreSQL/flexibleServers'
        properties: {
          serviceName: 'Microsoft.DBforPostgreSQL/flexibleServers'
        }
      }
    ]
    serviceEndpoints: [
      {
        service: 'Microsoft.Storage'
      }
      {
        service: 'Microsoft.Sql'
      }
      {
        service: 'Microsoft.KeyVault'
      }
    ]
  }
}

resource nsg 'Microsoft.Network/networkSecurityGroups@2023-09-01' = {
  name: '${vnetName}-nsg'
  location: location
  properties: {
    securityRules: [
      {
        name: 'AllowHTTPSInbound'
        properties: {
          priority: 100
          protocol: 'Tcp'
          access: 'Allow'
          direction: 'Inbound'
          sourceAddressPrefix: 'Internet'
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '443'
        }
      }
      {
        name: 'AllowHTTPInbound'
        properties: {
          priority: 110
          protocol: 'Tcp'
          access: 'Allow'
          direction: 'Inbound'
          sourceAddressPrefix: 'Internet'
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '80'
        }
      }
    ]
  }
}

resource subnetNsgAssociation 'Microsoft.Network/virtualNetworks/subnets/networkSecurityGroupAssociations@2023-09-01' = {
  parent: subnet
  name: 'default'
  properties: {
    networkSecurityGroup: {
      id: nsg.id
    }
  }
}

output vnetId string = vnet.id
output subnetId string = subnet.id
output vnetName string = vnet.name
output subnetName string = subnet.name
