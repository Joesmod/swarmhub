FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create data directory for SQLite
RUN mkdir -p data

EXPOSE 3847

CMD ["npm", "start"]
