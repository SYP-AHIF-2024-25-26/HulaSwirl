FROM node:18 AS build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM httpd:alpine AS production-stage

COPY --from=build-stage /app/dist/frontend/browser /usr/local/apache2/htdocs/

EXPOSE 80
