# Stage 1 — build: Node with all dev dependencies, only used to produce dist/
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Type-check and produce the static bundle in dist/
RUN npm run build

# Stage 2 — serve: a small nginx image with nothing but the built files.
# Node, node_modules and the source never reach the final image.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
