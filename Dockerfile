FROM node:12.16-alpine

RUN mkdir /app

COPY . /app

WORKDIR /app

#RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

RUN apk upgrade --update \
    && apk --no-cache --update add build-base \
    && apk add bash git ca-certificates \
    && git config --global url."https://".insteadOf git:// \
    && git config --global http.lowSpeedTime 600 \
    && npm install -g bower \
    && npm install \
    && apk del git \
    && rm -rf /var/cache/apk/*  /app/.git /app/screenshots  /app/test

RUN npm install

RUN chmod 755 /app/start.sh

EXPOSE 1337 8889

ENTRYPOINT ["/app/start.sh"]
