FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Type-check and produce the static bundle in dist/
RUN npm run build

EXPOSE 5173
# Serve the production build; --host makes it reachable from outside the container.
CMD ["npm", "run", "preview", "--", "--host", "--port", "5173"]
