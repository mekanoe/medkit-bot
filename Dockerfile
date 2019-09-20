FROM node:current-alpine AS base
WORKDIR /work


FROM base AS builder
RUN apk add --no-cache git python build-base
COPY package.json package-lock.json ./
RUN npm ci --production


FROM base AS run
COPY --from=builder /work/ /work/
COPY . .
CMD node main.js