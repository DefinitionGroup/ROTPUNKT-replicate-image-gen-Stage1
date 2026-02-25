# Based on https://pnpm.io/docker
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest
RUN corepack enable
RUN corepack prepare pnpm@^10 --activate

COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm run build

# Production image — uses Next.js standalone output
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone server (includes required node_modules)
COPY --from=build /app/.next/standalone ./
# Copy static assets and public files
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE $PORT

CMD ["node", "server.js"]
