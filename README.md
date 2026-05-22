# Alts-Bot

Discord bot para organizar principalmente eventos de grupos tipicos de los juegos MMORPG.

## Comandos

- **/help:** Información de los comandos.
- **/report:** Envia un mensaje privado al admin del bot.
- **/vote:** Genera un cuestionario de votos.
- **/evento:** Para crear el evento distribuido en 3 roles (tank, dps y heal).
- **/ping:** Test de conectividad.
- **/edit:** Permite modificar algunos cuadros de texto del bot que tengan habilitado el emoji del lapiz.
- **/notice:** Permite mandar un mensaje con algunos estilos.
- **/adduser evento:** Permite añadir un usuario a un evento activo sin necesidad que reaccione para apuntarse.
- **/removeuser eevento:** Permite retirar un usuario apuntado al evento sin realizar las acciones de reacción a los emojis.

## Ejecución

Instalación de las dependencias del proyecto:

```
npm install -g pnpm@latest-11

pnpm install
```

Necesario fichero variables de entorno .env para arrancar la configuración del bot con las siguientes variables:
```
TOKEN=codigo_token
ID_OWNER=usuarioAdminID
CLIENT_ID=clientId
GUILD_ID_DEV=idServerDiscord
ENTORNO=DES
LOG_INFO=true
LOG_DEBUG=true
LOG_ERROR=true
LOG_WARN=true
LOG_SUCCESS=true
```
Arranque con:
```
npm start
```

## Docker

Para montar la imagen al docker:

```
docker build -t nombre-imagen .
```
En la ruta donde tengas un .env configurador:

```
docker run -d --name nombre-contenedor --env-file .env nombre-imagen
```

### Otros comandos docker

Para inspeccionar todas las configuraciones como el Env:

```
docker inspect nombre-contenedor
```

Otros comandos:

```
docker start nombre-contenedor

docker stop nombre-contenedor

docker ps

docker ps -a
```

