# Imagen base Node 24 ligera
FROM node:24-alpine

# Instalar pnpm globalmente en el contenedor
RUN npm install -g pnpm

# Directorio del contenedor del app
WORKDIR /app-altsBot

# Copiar package.json y package-lock.json primero
COPY package.json pnpm-lock-yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del proyecto
COPY . .

# Comando por defecto para iniciar el bot
CMD ["pnpm", "start"]
