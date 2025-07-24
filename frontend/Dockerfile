FROM node:18-alpine

ARG REACT_APP_MAPBOX_TOKEN
ENV REACT_APP_MAPBOX_TOKEN=$REACT_APP_MAPBOX_TOKEN

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using npm install instead of npm ci
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]