FROM node:18-alpine

WORKDIR /app

# Install dependencies using shared lockfile
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only the user service source
COPY user-service/. .

RUN addgroup -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 50053

CMD ["node", "userMicroservice.js"]
