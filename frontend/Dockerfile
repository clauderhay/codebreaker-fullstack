# Frontend Dockerfile for Code Breaker React Native App
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose Expo ports
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start Expo
CMD ["npm", "run", "web"]
