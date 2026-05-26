FROM node:20-alpine

ARG APP_DIR

WORKDIR /app

COPY --chown=node:node ${APP_DIR}/package*.json ./
RUN npm ci

COPY --chown=node:node ${APP_DIR}/ ./

EXPOSE 3003 3004 3005 3006 5173

USER node

CMD ["npm", "start"]
