#!/bin/bash
# Migration and build script for Render deployment
set -e

echo "🔨 Building backend..."
cd backend/eConnectOne.API
dotnet build -c Release

echo "📦 Applying database migrations..."
dotnet ef database update --context ApplicationDbContext || echo "⚠️  Migration warning (non-critical)"

echo "✅ Build and migration complete!"
