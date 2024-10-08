# Step 1: Base image
FROM node:14-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the React app
# RUN npm run build

# Step 7: Install a simple HTTP server for serving static files
# RUN npm install -g serve

# Step 8: Expose the port
EXPOSE 3000

# Step 9: Run the app
#CMD ["serve", "-s", "build"]
CMD ["npm", "start"]