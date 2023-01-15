FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN chmod +x ./utils/wait-for-it.sh

CMD ["./utils/wait-for-it.sh", "rabbitmq:5672", "--", "node", "index.js"]
