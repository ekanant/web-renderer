# Install dependencies only when needed
FROM node:16.6.1-alpine3.14 AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:16.6.1-alpine3.14 AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn install --production --ignore-scripts --prefer-offline

# Production image, copy all the files and run next
FROM node:16.6.1-alpine3.14 AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

#Install chromium
ENV CHROMIUM_BIN="/usr/bin/chromium-browser"
RUN apk --no-cache update \ 
      && apk --no-cache  upgrade \
      && apk add --no-cache chromium=91.0.4472.164-r0 \
      && rm -rf /var/cache/apk/* /tmp/*

USER nodejs

EXPOSE 3000

CMD ["yarn", "start"]