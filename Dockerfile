# Multi-stage build for eConnectOne backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

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
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

COPY --from=build /app/publish .

# Expose port
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "eConnectOne.API.dll"]
