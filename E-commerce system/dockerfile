FROM node:22 AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json nest-cli.json ./
RUN npm install
ENV PORT=3000
EXPOSE $PORT

FROM base AS development
CMD ["npm", "run", "start:dev"]

FROM base AS production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
