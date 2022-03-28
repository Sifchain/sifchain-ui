FROM node:17.4.0 as builder

RUN mkdir -p /app
RUN mkdir -p /core

ARG SIFNODE_API
ARG SIFNODE_WS_API
ENV VUE_APP_SIFNODE_API=$SIFNODE_API
ENV VUE_APP_SIFNODE_WS_API=$SIFNODE_WS_API

COPY ./package.json /package.json
COPY ./yarn.lock /yarn.lock
COPY ./app/package.json /app/package.json
COPY ./app/yarn.lock /app/yarn.lock
COPY ./core/package.json /core/package.json
COPY ./core/yarn.lock /core/yarn.lock
WORKDIR /ui
RUN yarn

COPY . /ui
RUN yarn core:build
RUN yarn app:build

FROM flashspys/nginx-static
RUN apk update && apk upgrade
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder  /app/dist /static