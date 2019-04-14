### INSTALLER/BUILDER
FROM node:11
COPY . /src
RUN cd /src && yarn

### FINAL
FROM mhart/alpine-node:11
WORKDIR /src
ENV DATA_PATH /data
RUN npm i -g pm2
COPY --from=0 /src /src
CMD pm2-docker main.js
