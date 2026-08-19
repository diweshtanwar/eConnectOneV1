using './main.bicep'

param environment = 'prod'
param location = 'southeastasia'
param repoOwner = 'diweshtanwar'
param repoName = 'eConnectOneV1'
param branch = 'main'

param neonConnectionString = 'postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOSTNAME.neon.tech/eConnectOne?sslmode=require'
param jwtSecretKey = replace('-', '', (New-Guid).Guid) + replace('-', '', (New-Guid).Guid)
