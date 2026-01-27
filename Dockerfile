FROM node:22-alpine AS builder

# Must be entire project because `prepare` script is run during dependency installation and requires all files.
WORKDIR /app

COPY src/ ./src/
COPY package.json package-lock.json tsconfig.json ./

# Workaround for SSL certificate issues in corporate environments
RUN npm config set strict-ssl false && npm install

RUN npm run build

FROM node:22-alpine AS release

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV MCP_TRANSPORT=sse
ENV PORT=3000

WORKDIR /app

RUN npm config set strict-ssl false && npm install --ignore-scripts --omit-dev

# Expose SSE server port
EXPOSE 3000

LABEL org.opencontainers.image.source="https://github.com/rosemary-charnley-smartbear/Loopio-MCP/tree/sales-deployment"
LABEL org.opencontainers.image.description="Loopio MCP Server for Sales Representatives"

ENTRYPOINT ["node", "dist/index.js"]
