# Multi-stage build for eConnectOne backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

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

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=build /app/publish .

# Expose ports: 80 for Azure App Service, 10000 for local dev
EXPOSE 80 10000
ENV ASPNETCORE_URLS=http://+:${ASPNETCORE_PORT:-80}

ENTRYPOINT ["dotnet", "eConnectOne.API.dll"]
