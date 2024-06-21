# Build with:   docker build -t IMAGE_NAME .
# Run with:     docker run -p 3000:3000 --name IMAGE_NAME IMAGE_NAME

FROM node:20-alpine AS build
WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production
ENV NODE_ENV="production"

FROM node:20-alpine AS production
COPY --from=build /app/build .
COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .
RUN npm ci --omit-dev

EXPOSE 3000
CMD ["node", "-r", "dotenv/config", "."]