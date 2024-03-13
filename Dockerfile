FROM node:alpine

WORKDIR /events-backend

COPY tsconfig*.json ./

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ENTRYPOINT ["/events-backend/dev.entrypoint.sh"]