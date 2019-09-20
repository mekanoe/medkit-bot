
FROM golang:lts-alpine AS golang-amd64
FROM arm32v7/golang:lts-alpine as golang-arm
FROM arm64v8/golang:lts-alpine as golang-arm64
FROM golang-$TARGETARCH as base
ARG TARGETARCH
WORKDIR /work

FROM base as nodebuild
RUN apk add --no-cache git python build-base

FROM nodebuild AS builder
COPY package*.json ./
#RUN npm ci --production

FROM base AS run
COPY --from=builder /work/ /work/
COPY . .
CMD node main.js