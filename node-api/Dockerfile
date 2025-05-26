FROM node:20

WORKDIR /app

# Copy only package files and install dependencies first
COPY package*.json tsconfig.json ./
RUN npm install

# Copy source and config
COPY ./src ./src
COPY drizzle.config.ts ./
COPY ./drizzle ./drizzle

# Run migrations and start app
CMD npm run db:push && npm run db:seed && npm run dev
