# =======================================
FROM registry.access.redhat.com/ubi8/nodejs-16 as appbase
# =======================================

# Install yarn and set yarn version
USER root
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum -y install yarn

ENV YARN_VERSION 1.22.4
RUN yarn policies set-version $YARN_VERSION

COPY package.json yarn.lock /opt/app-root/src/
RUN chown -R default:root /opt/app-root/src

USER default

# Install dependencies
RUN yarn && yarn cache clean --force

# Copy all files
COPY --chown=default:default . .

# =============================
FROM appbase as development
# =============================

# Use non-root user
USER default

# Bake package.json start command into the image
CMD ["yarn", "dev"]

# ===================================
FROM appbase as staticbuilder
# ===================================

# Use non-root user
USER default

# Set environmental variables (when building image on GitHub) 
# specified in github workflow files  
ARG NEXT_PUBLIC_LINKED_EVENTS_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_ENVIRONMENT
ARG SENTRY_AUTH_TOKEN
ARG NEXT_PUBLIC_OIDC_AUTHORITY
ARG NEXT_PUBLIC_OIDC_CLIENT_ID
ARG NEXT_PUBLIC_OIDC_API_SCOPE
ARG NEXTAUTH_URL

# copy all files
COPY --chown=default:default . .

# Build application
RUN yarn build

# ==========================================
FROM registry.access.redhat.com/ubi8/nodejs-16 AS production
# ==========================================

# Install yarn and set yarn version
USER root
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum -y install yarn

ENV YARN_VERSION 1.22.4
RUN yarn policies set-version $YARN_VERSION

# Copy build folder from staticbuilder stage
COPY --from=staticbuilder --chown=default:default /opt/app-root/src/.next /opt/app-root/src/.next

# Copy next.js config
COPY --chown=default:default next-i18next.config.js /opt/app-root/src/
COPY --chown=default:default next.config.js /opt/app-root/src/

# Copy public folder
COPY --chown=default:default public /opt/app-root/src/public
# Copy package.json and yarn.lock files
COPY --chown=default:default package.json yarn.lock /opt/app-root/src/

# Install production dependencies
RUN yarn install --production --frozen-lockfile && yarn cache clean --force

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Expose port
EXPOSE $PORT

# Start ssr server
CMD ["yarn", "start"]
