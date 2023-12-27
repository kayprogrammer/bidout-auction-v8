FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY ./src/initials ./initials

RUN chmod +x ./initials/initials.sh

CMD ["bash", "./initials/initials.sh"]