FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy all files
COPY . .

# Build the project
RUN npm run build

# Start the server
CMD ["node", "dist/index.js"]