# Multi-stage build for eConnectOne — combined landing site + frontend (portal) + backend, single container
# Stage 1: Build the React/Vite frontend (portal)
# Served under /app so the public landing-site/ can occupy the domain root ("/").
FROM node:20-alpine AS frontend-build
WORKDIR /src/frontend
ARG VITE_API_BASE_URL=
ARG VITE_BASE_PATH=/app/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASE_PATH=$VITE_BASE_PATH
COPY frontend/package*.json ./
# --legacy-peer-deps: @vitejs/plugin-react@6's optional peer on @rolldown/plugin-babel
# conflicts with another Babel peer in the tree; npm ci enforces peer resolution strictly
# even though the lockfile already pins compatible versions.
RUN npm ci --silent --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Build and publish the .NET backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

# Copy project files
COPY backend/eConnectOne.API/eConnectOne.API.csproj ./backend/eConnectOne.API/
COPY backend/ ./backend/

# Restore dependencies
RUN dotnet restore backend/eConnectOne.API/eConnectOne.API.csproj

# Build
WORKDIR /src/backend/eConnectOne.API
RUN dotnet build eConnectOne.API.csproj -c Release -o /app/build

# Publish
RUN dotnet publish eConnectOne.API.csproj -c Release -o /app/publish

# Stage 3: Runtime image — serves the API, the public landing-site at "/",
# and the built React portal under "/app" — all from wwwroot
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=backend-build /app/publish .
COPY landing-site/ ./wwwroot/
COPY --from=frontend-build /src/frontend/dist ./wwwroot/app

# Expose ports: 80 for Azure Container Apps/App Service, 10000 for local dev
EXPOSE 80 10000
ENV ASPNETCORE_URLS=http://+:${ASPNETCORE_PORT:-80}

ENTRYPOINT ["dotnet", "eConnectOne.API.dll"]
