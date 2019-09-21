
FROM node:lts-alpine AS base
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