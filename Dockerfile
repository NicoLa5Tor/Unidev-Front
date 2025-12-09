# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build -- --configuration production

# Runtime stage
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx content
RUN rm -rf ./*

# Copy compiled app
COPY --from=builder /app/dist/unidev-front/browser ./

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
