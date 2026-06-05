FROM node:22-alpine AS base

# Builder stage
FROM base AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Copy source code and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner stage (Production)
FROM base AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Generate Prisma client for the runner environment
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Create user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 3000

ENV NODE_ENV production

# Ensure the app binds to 0.0.0.0
CMD ["node", "dist/src/main"]
