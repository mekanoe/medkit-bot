### INSTALLER/BUILDER
FROM node:10
COPY . /src
RUN cd /src && npm i

### FINAL
FROM mhart/alpine-node:10
WORKDIR /src
ENV DATA_PATH /data
RUN npm i -g pm2
COPY --from=0 /src /src
CMD pm2-docker main.js
