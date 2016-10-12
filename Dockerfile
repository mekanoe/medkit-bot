FROM mhart/alpine-node:6.7
MAINTAINER Katie Thornhill <kath@splitmedialabs.com>

RUN apk add --no-cache su-exec &&\
	npm install --verbose -g pm2

RUN adduser -D -s /bin/ash nodeuser &&\
	mkdir /src /data &&\
	chown nodeuser:nodeuser /src &&\
	chmod 777 /src &&\
	chown nodeuser:nodeuser /data &&\
	chmod 777 /data

WORKDIR /src
CMD ["su-exec", "nodeuser", "pm2", "start", "bot.js", "-i", "0", "--no-daemon"]

ENV DATA_PATH /data

COPY . /src