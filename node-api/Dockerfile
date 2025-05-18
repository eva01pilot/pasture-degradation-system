FROM node:20

WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json tsconfig.json ./
RUN npm install

# Copy the source code
COPY ./src ./src

CMD ["npm", "run", "dev"]
