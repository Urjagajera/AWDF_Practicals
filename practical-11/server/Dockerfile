FROM node:18

WORKDIR /app

# Dependencies first, so this layer is reused when only source files change.
COPY package*.json ./
RUN npm install

COPY . .
# TypeScript → JavaScript in dist/
RUN npm run build

EXPOSE 5000
CMD ["node", "dist/server.js"]
