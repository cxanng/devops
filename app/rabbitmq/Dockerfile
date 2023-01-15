FROM rabbitmq:3.9-management

EXPOSE 5672
EXPOSE 15672

RUN apt update
RUN apt install nodejs -y
RUN apt install npm -y

COPY package*.json ./

RUN npm i

COPY . .
EXPOSE 8888

RUN ["chmod", "+x", "command.sh"]
ENTRYPOINT ["./command.sh"]