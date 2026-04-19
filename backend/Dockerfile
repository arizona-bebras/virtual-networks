FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS deps

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend/package.json backend/package.json
COPY proto/package.json proto/package.json

RUN pnpm install --filter backend... --frozen-lockfile --ignore-scripts

FROM deps AS build

WORKDIR /app

COPY backend backend
COPY proto proto

RUN pnpm --filter backend build

FROM base AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend/package.json backend/package.json
COPY proto proto

RUN pnpm install --filter backend... --prod --frozen-lockfile --ignore-scripts

COPY --from=build /app/backend/dist backend/dist

WORKDIR /app/backend

EXPOSE 3000

CMD ["pnpm", "start:prod"]
