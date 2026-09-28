FROM node:22-alpine AS development

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install -g npm@11 && npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY . .

EXPOSE 5000

FROM development AS production

ENV NODE_ENV=production

RUN npm run build

CMD ["node", "dist/main.js"]
