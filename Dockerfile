FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

RUN npm ci
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

ARG VERSION=0.2.3
ARG VCS_REF=unknown
ARG REPO_URL=https://github.com/outscraper/outscraper-mcp-server

LABEL org.opencontainers.image.title="Outscraper MCP" \
      org.opencontainers.image.description="Official Outscraper MCP server for business discovery, enrichment, Google Maps data, AI scraping, and async request workflows." \
      org.opencontainers.image.source="${REPO_URL}" \
      org.opencontainers.image.url="${REPO_URL}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.licenses="MIT"

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node README.md DOCKERHUB.md LICENSE server.json .env.example ./

EXPOSE 3000

USER node

CMD ["node", "dist/index.js"]
