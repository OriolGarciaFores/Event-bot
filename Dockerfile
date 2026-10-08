# Imagen base Node 24 ligera
FROM node:24-alpine

# Habilitar corepack para usar pnpm nativo de Node
RUN corepack enable && corepack prepare pnpm@latest --activate

# Directorio del contenedor del app
WORKDIR /app-altsBot

# Copiar package.json y package-lock.json primero
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del proyecto
COPY . .

# Comando por defecto para iniciar el bot
CMD ["pnpm", "start"]