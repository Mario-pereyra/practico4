FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# El comando se especificará en el docker-compose para poder ejecutar migraciones antes de arrancar
CMD ["npm", "run", "start:prod"]
