FROM node:22.12.0-alpine

WORKDIR /usr/src/app

# Copiar archivos de definición de dependencias primero para optimizar la caché de Docker
COPY package*.json ./

RUN npm install

# Copiar el resto de archivos del proyecto
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
