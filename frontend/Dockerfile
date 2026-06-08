FROM node:24-alpine AS build
WORKDIR /app
ARG REACT_APP_API_URL=http://localhost:3000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# Patch OS packages (e.g. libxml2) so the Trivy CRITICAL/HIGH gate passes (ADR-004).
RUN apk upgrade --no-cache
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
