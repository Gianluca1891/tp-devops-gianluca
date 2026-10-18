# ---------- Etapa 1: instalar dependencias de producción ----------
FROM node:22.17.0-alpine AS dependencias

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Etapa 2: imagen final que se ejecuta ----------
FROM node:22.17.0-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY --from=dependencias /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

USER node

EXPOSE 3000
CMD ["node", "src/server.js"]