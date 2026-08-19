using './main.bicep'

param environment = 'dev'
param location = 'southeastasia'
param repoOwner = 'diweshtanwar'
param repoName = 'eConnectOneV1'
param branch = 'main'

// Neon.tech connection string format: postgresql://user:password@hostname/dbname?sslmode=require
// Get this from https://console.neon.tech after creating a project
param neonConnectionString = 'postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOSTNAME.neon.tech/eConnectOne?sslmode=require'

// Generate a secure JWT secret key (64 random characters)
param jwtSecretKey = replace('-', '', (New-Guid).Guid) + replace('-', '', (New-Guid).Guid)
