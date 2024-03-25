FROM node:18-alpine AS builder

# A small line inside the image to show who made it
LABEL Developers="EWE s.r.o."

# The WORKDIR instruction sets the working directory for everything that will happen next
WORKDIR /app

# Copy all local files into the image
COPY . .

# Clean install all node modules
RUN npm ci

# Build SvelteKit app
RUN npm run build
