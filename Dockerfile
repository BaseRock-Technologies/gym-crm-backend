FROM public.ecr.aws/docker/library/node:20-alpine

RUN npm install -g nodemon

RUN apk add --no-cache git

WORKDIR /app

COPY package*.json ./

COPY yarn.lock ./

RUN yarn install

COPY . .


EXPOSE 5696

CMD ["node", "main.js"]
