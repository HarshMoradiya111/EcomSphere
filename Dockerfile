# Use the official, lightweight Node.js 20 Linux image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json first to cache the npm install step
COPY package*.json ./

# Install dependencies (strictly)
RUN npm install

# Copy all the remaining backend files into the container
COPY . .

# Expose Port 3000 for the host machine to access
EXPOSE 3000

# Start the Express server
CMD ["npm", "start"]
