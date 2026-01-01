FROM node:18-alpine

WORKDIR /app

# Install dependencies using shared lockfile
COPY package*.json ./
RUN npm install --omit=dev

# Copy only the gateway source
COPY api-gateway/. .

# Security: non-root user
RUN addgroup -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
