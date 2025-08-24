# Imagen base Node 24 ligera
FROM node:24-alpine

# Directorio del contenedor del app
WORKDIR /app-altsBot

# Crear carpeta vacía para la DB
RUN mkdir -p dataBase

# Copiar package.json y package-lock.json primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Comando por defecto para iniciar el bot
CMD ["npm", "start"]
