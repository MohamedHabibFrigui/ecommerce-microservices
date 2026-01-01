FROM node:18-alpine

WORKDIR /app

# Install dependencies using shared lockfile
COPY package*.json ./
RUN npm install --omit=dev

# Copy only the product service source
COPY product-service/. .

RUN addgroup -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 50051

CMD ["node", "productMicroservice.js"]