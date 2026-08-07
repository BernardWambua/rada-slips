FROM node:22-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3001

FROM development AS production

ENV NODE_ENV=production

RUN npm run build

CMD ["npm", "run", "start"]
