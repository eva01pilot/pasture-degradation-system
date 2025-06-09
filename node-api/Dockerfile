FROM node:20
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy only package files and install dependencies first
COPY package*.json tsconfig.json ./
RUN pnpm install

# Copy source and config
COPY ./src ./src
COPY drizzle.config.ts ./
COPY ./drizzle ./drizzle

# Run migrations and start app
CMD npm run db:push && npm run dev
