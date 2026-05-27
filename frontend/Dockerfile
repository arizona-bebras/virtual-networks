FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS deps

WORKDIR /app

COPY pnpm-workspace.yaml .npmrc ./
COPY pnpm-lock*.yaml ./
COPY frontend/package.json frontend/package.json
COPY common/package.json common/package.json

RUN pnpm install --merge-git-branch-lockfiles --lockfile-only --ignore-scripts
RUN pnpm install --filter frontend... --frozen-lockfile --ignore-scripts

FROM deps AS build

WORKDIR /app

ARG PUBLIC_API_URL=http://localhost:8080
ENV PUBLIC_API_URL=$PUBLIC_API_URL

COPY frontend frontend
COPY common common

RUN pnpm --filter frontend build

FROM nginx:1.27-alpine AS production

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
