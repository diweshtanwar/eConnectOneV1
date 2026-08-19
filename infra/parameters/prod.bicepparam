using './main.bicep'

param environment = 'prod'
param location = 'southeastasia'

// Set these as GitHub secrets: POSTGRES_ADMIN_PASSWORD and JWT_SECRET_KEY
// They are passed in by the GitHub Actions workflow — do NOT hardcode here
param postgresAdminPassword = ''
param jwtSecretKey = ''
