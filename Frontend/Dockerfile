# Build Stage
FROM arm64v8/node:18 AS build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Production Stage
FROM arm64v8:alpine AS production-stage

COPY --from=build-stage /app/dist/frontend/browser /usr/local/apache2/htdocs/
EXPOSE 80
