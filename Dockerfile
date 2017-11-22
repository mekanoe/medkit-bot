FROM mhart/alpine-node:9.2

RUN apk add --no-cache su-exec &&\
  npm i --verbose -g pm2

COPY . /src
WORKDIR /src
RUN adduser -D -s /bin/ash nodeuser &&\
  mkdir /data &&\
  chown -R nodeuser:nodeuser /src &&\
  chmod 777 /src &&\
  chown -R nodeuser:nodeuser /data &&\
  chmod 777 /data &&\
  apk add --no-cache python g++ make &&\
  su-exec nodeuser npm i &&\
  apk del python g++ make

CMD ["su-exec", "nodeuser", "pm2", "start", "main.js", "--no-daemon"]

ENV DATA_PATH /data