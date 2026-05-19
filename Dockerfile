FROM node:20-alpine

ARG APP_DIR

WORKDIR /app

COPY ${APP_DIR}/package*.json ./
RUN npm ci

COPY ${APP_DIR}/ ./

EXPOSE 3003 3004 3005 3006 5173

CMD ["npm", "start"]
