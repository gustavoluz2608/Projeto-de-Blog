# Backend (.NET 6)
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

COPY Blog.Api.csproj ./
RUN dotnet restore ./Blog.Api.csproj

COPY . ./
RUN dotnet publish ./Blog.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "Blog.Api.dll"]
