# ============================================================
FROM registry.access.redhat.com/ubi8/nodejs-16 AS dependencies
# ============================================================
WORKDIR /app

# Install yarn and set yarn version
USER root
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum -y install yarn

ENV YARN_VERSION 1.22.4
RUN yarn policies set-version $YARN_VERSION

# Install dependencies
COPY package.json yarn.lock /app/
RUN chown -R default:root /app

USER default

RUN yarn --frozen-lockfile

COPY next-i18next.config.js next.config.js sentry.client.config.js sentry.properties sentry.server.config.js tsconfig.json /app/
COPY /public/ /app/public
COPY /src/ /app/src

# =============================
FROM dependencies AS development
# =============================
WORKDIR /app

USER default

# Bake package.json start command into the image
CMD yarn next dev -p ${PORT}

# ============================================================
FROM dependencies AS builder
# ============================================================
WORKDIR /app

USER default

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Set environmental variables (when building image on Azure) 
# specified in pipelines/library files 
ARG NEXT_PUBLIC_LINKED_EVENTS_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ARG NEXT_PUBLIC_ENVIRONMENT

ARG OIDC_ISSUER
ARG OIDC_API_TOKENS_URL
ARG OIDC_CLIENT_ID
ARG OIDC_CLIENT_SECRET
ARG OIDC_LINKED_EVENTS_API_SCOPE
ARG OIDC_TOKEN_URL

ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

ARG NEXT_ENV

RUN yarn build

# ============================================================
FROM registry.access.redhat.com/ubi8/nodejs-16 AS production
# ============================================================
WORKDIR /app

USER root
RUN groupadd --system --gid 1001 nodejs

USER default

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=default:nodejs /app/.next/standalone ./
COPY --from=builder --chown=default:nodejs /app/.next/static ./.next/static

# Expose port
EXPOSE $PORT

CMD node server.js -p ${PORT}