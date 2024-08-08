FROM node:18

WORKDIR /usr/src/client

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

RUN npm run build

CMD ["npm", "run", "dev"]