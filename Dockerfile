
FROM node:lts-alpine AS node-amd64
FROM arm32v7/node:lts-alpine as node-arm
FROM arm64v8/node:lts-alpine as node-arm64
FROM node-$TARGETARCH as base
ARG TARGETARCH
WORKDIR /work

FROM base as nodebuild
RUN apk add --no-cache git python build-base

FROM nodebuild AS builder
COPY package*.json ./
RUN npm ci --production

FROM base AS run
COPY --from=builder /work/ /work/
COPY . .
CMD node main.js