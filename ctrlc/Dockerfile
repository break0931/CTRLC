# Step 1: Use an official Node.js image as the base
FROM node:22.14.0

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json (or yarn.lock) to the container
COPY package.json package-lock.json* ./ 

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of your project files (including server.js)
COPY . .

# Step 6: Expose the ports for the Fastify API and Next.js app
EXPOSE 4000 5000 6666 7777

# Step 7: Set the default command to run both the Next.js app and Fastify server
CMD ["npm", "run", "dev"]
