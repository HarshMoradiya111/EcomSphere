# Use lightweight Node image
FROM node:20-alpine

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all React source code
COPY . .

# Expose the Next.js port
EXPOSE 3001

# Run the development server precisely on port 3001 to avoid crashing into Express
CMD ["npx", "next", "dev", "-p", "3001"]
