FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Vite app (förutsätter ett "build"-script som kör Vite)
RUN npm run build

# ----- Runtime image -----
FROM node:18-alpine AS runner
WORKDIR /app

# Installera en enkel statisk server
RUN npm install -g serve

# Kopiera byggd frontend
COPY --from=builder /app/dist ./dist

# Cloud Run använder PORT-envvariabeln
ENV PORT=8080
EXPOSE 8080

# Starta servern och lyssna på $PORT (använder shell-form för env-var expansion)
CMD serve dist --single --listen 0.0.0.0:${PORT}

