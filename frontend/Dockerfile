# -- Build TypeScript --------------------------------------------------------
FROM node:16.4.2-slim AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install

COPY . .
COPY .env.production .env

RUN pnpm build

# -- Run server --------------------------------------------------------------
FROM node:16.4.2-slim AS run

WORKDIR /app
EXPOSE 3000
ENV NODE_ENV production

RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install --prod

COPY --from=build /app/.next ./.next

CMD [ "pnpm", "start" ]
