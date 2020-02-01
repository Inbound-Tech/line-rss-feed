FROM node:12.14

WORKDIR /app
COPY . .
RUN npm install

RUN yarn build

ENTRYPOINT [ "yarn", "start" ]

