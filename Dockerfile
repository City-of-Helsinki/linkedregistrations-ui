# ============================================================
FROM registry.access.redhat.com/ubi9/nodejs-24 AS dependencies
# ============================================================
WORKDIR /app

USER root

# Install pnpm
RUN npm install -g pnpm@11.1.3

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
RUN chown -R default:root /app

USER default

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY .env* next-i18next.config.js next.config.js sentry.edge.config.ts sentry.properties sentry.server.config.ts tsconfig.json /app/
COPY /scripts/ /app/scripts
COPY /public/ /app/public
COPY /src/ /app/src

# =============================
FROM dependencies AS development
# =============================
WORKDIR /app

USER default

# Bake package.json start command into the image
CMD pnpm next dev -p ${PORT}

# ============================================================
FROM dependencies AS builder
# ============================================================
WORKDIR /app

USER default:root

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time values injected by Azure pipelines (via --build-arg).
ARG PORT
ARG SENTRY_PROJECT
ARG SENTRY_ORG
ARG SENTRY_URL
ARG NEXT_ENV
ARG NEXT_PUBLIC_SENTRY_RELEASE

# When building locally with Docker Compose, the auth token can be provided using SENTRY_AUTH_TOKEN environment variable.
# Our AzDO pipeline uses /secrets/SENTRY_AUTH_TOKEN to pass the auth token so this works there too.
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,gid=0,target=/secrets/SENTRY_AUTH_TOKEN \
    SENTRY_AUTH_TOKEN="$(cat /secrets/SENTRY_AUTH_TOKEN 2>/dev/null)" pnpm build

# ============================================================
FROM registry.access.redhat.com/ubi9/nodejs-24-minimal AS production
# ============================================================
WORKDIR /app

USER root
RUN microdnf install -y shadow-utils && microdnf clean all && \
    groupadd --system --gid 1001 nodejs && \
    useradd --uid 1000 --gid 0 --home /app --no-create-home --shell /sbin/nologin default

USER default

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=default:root /app/public ./public
COPY --from=builder --chown=default:root /app/scripts ./scripts

# Allow OpenShift/Azure-style random non-root users (gid 0) to write runtime env file.
RUN chmod -R g=u /app/public /app/scripts && \
    rm -f /app/public/env-config.js && \
    ln -s /tmp/env-config.js /app/public/env-config.js

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=default:nodejs /app/.next/standalone ./
COPY --from=builder --chown=default:nodejs /app/.next/static ./.next/static

# Expose port
EXPOSE $PORT

ENTRYPOINT ["sh", "/app/scripts/docker-entrypoint.sh"]
CMD ["sh", "-c", "node server.js -p ${PORT}"]
