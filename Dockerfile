# =======================================
FROM helsinkitest/node:12-slim as appbase
# =======================================

# Use non-root user
USER appuser

# Yarn
ENV YARN_VERSION 1.22.4
RUN yarn policies set-version $YARN_VERSION

# Install dependencies
COPY --chown=appuser:appuser package.json yarn.lock /app/
RUN yarn && yarn cache clean --force

# Copy all files
COPY --chown=appuser:appuser . .

# =============================
FROM appbase as development
# =============================

# Use non-root user
USER appuser

# copy all files
COPY --chown=appuser:appuser . .

# Bake package.json start command into the image
CMD ["yarn", "dev"]

# ===================================
FROM appbase as staticbuilder
# ===================================

# Set environmental variables (when building image on GitHub) 
# specified in github workflow files  


# Use non-root user
USER appuser

# copy all files
COPY --chown=appuser:appuser . .

# Build application
RUN yarn build

# ==========================================
FROM helsinkitest/node:12-slim AS production
# ==========================================

# Use non-root user
USER appuser

# Copy build folder from staticbuilder stage
COPY --from=staticbuilder --chown=appuser:appuser /app/.next /app/.next

# Copy next.js config
COPY --chown=appuser:appuser next-i18next.config.js /app/
COPY --chown=appuser:appuser next.config.js /app/

# Copy public folder, package.json and yarn.lock files
COPY --chown=appuser:appuser public package.json yarn.lock /app/

# Install production dependencies
RUN yarn install --production --frozen-lockfile && yarn cache clean --force

# Expose port
EXPOSE $PORT

# Start ssr server
CMD ["yarn", "start"]