
FROM node:lts AS base
WORKDIR /work

FROM base as nodebuild
RUN apt-get update && apt-get install -y \
        git \
        python \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

FROM nodebuild AS builder
COPY package*.json ./
RUN npm ci --production

FROM base AS run
COPY --from=builder /work/ /work/
COPY . .
CMD node main.js