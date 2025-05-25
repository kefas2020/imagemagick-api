# Use Node.js base image
FROM node:18

# Install ImageMagick
RUN apt-get update && \
    apt-get install -y imagemagick && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]