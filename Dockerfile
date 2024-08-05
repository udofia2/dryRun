FROM node:20-alpine

WORKDIR /app

COPY tsconfig*.json ./

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 4000

ENTRYPOINT ["/app/dev.entrypoint.sh"]