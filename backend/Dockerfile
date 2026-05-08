FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS deps

WORKDIR /app

COPY pnpm-workspace.yaml .npmrc ./
COPY pnpm-lock*.yaml ./
COPY backend/package.json backend/package.json
COPY common/package.json common/package.json
COPY proto/package.json proto/package.json

RUN pnpm install --merge-git-branch-lockfiles --lockfile-only --ignore-scripts
RUN pnpm install --filter backend... --frozen-lockfile --ignore-scripts

FROM deps AS build

RUN apk add protobuf-dev
WORKDIR /app

COPY backend backend
COPY common common
COPY proto proto

RUN pnpm --filter backend build

FROM base AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY pnpm-workspace.yaml .npmrc ./
COPY pnpm-lock*.yaml ./
COPY backend/package.json backend/package.json
COPY common/package.json common/package.json
COPY proto/package.json proto/package.json

RUN pnpm install --merge-git-branch-lockfiles --lockfile-only --ignore-scripts

RUN pnpm install --filter backend... --prod --frozen-lockfile --ignore-scripts

COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/common/dist common/dist
COPY --from=build /app/proto/dist proto/dist
COPY --from=build /app/proto/src proto/src

WORKDIR /app/backend

EXPOSE 3000

CMD ["pnpm", "start:prod"]
