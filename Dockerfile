FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /build
WORKDIR /build

FROM base as build-stage
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM nginx:latest as production-stage

COPY --from=build-stage /build/packages/sample/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
