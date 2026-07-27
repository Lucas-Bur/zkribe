FROM node:24-bookworm AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM gcr.io/distroless/nodejs24-debian12:nonroot

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app

COPY --from=build --chown=nonroot:nonroot /app/.output ./.output

EXPOSE 3000

CMD [".output/server/index.mjs"]
