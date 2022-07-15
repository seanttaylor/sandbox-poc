FROM node:16-alpine

RUN mkdir /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
COPY ./lib /app/lib
COPY ./schemas /app/schemas
COPY ./src /app/src

RUN chown node -R /app

WORKDIR /app

RUN npm ci --omit=dev

EXPOSE 9000

CMD [ "npm", "start" ]