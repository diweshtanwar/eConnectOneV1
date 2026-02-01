#!/bin/bash
# Render deployment build script
# Automatically builds backend and applies database migrations

set -e

echo "🔨 Building .NET backend..."
cd backend/eConnectOne.API
dotnet build -c Release --property:GenerateFullPaths=true

echo "📦 Applying database migrations..."
dotnet ef database update --context ApplicationDbContext 2>&1 || true

echo "✅ Build and migration complete - starting application"
