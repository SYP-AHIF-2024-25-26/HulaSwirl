# ----------------------------------------
# 1) Base image for runtime
# ----------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base

# If your build environment sets APP_UID (e.g., for non-root containers),
# you can keep it. Otherwise, remove the USER line if not needed.
USER $APP_UID

WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Set default DB connection string
ENV DB_CONNECTION_STRING="Server=mydb;Database=Hula;User=root;Password=password;Port=3306;"

# ----------------------------------------
# 2) SDK image for building
# ----------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["NewBackend.csproj", "./"]
RUN dotnet restore "NewBackend.csproj"

COPY . .
WORKDIR "/src/"
RUN dotnet build "NewBackend.csproj" -c $BUILD_CONFIGURATION -o /app/build

# ----------------------------------------
# 3) Publish
# ----------------------------------------
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "NewBackend.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false

# ----------------------------------------
# 4) Final image with compiled artifacts
# ----------------------------------------
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Launch the .NET application
ENTRYPOINT ["dotnet", "NewBackend.dll"]
