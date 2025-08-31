# Globale Argumente für API-URLs
# ARG API_URL_DEV=http://127.0.0.1:8000/api/
# ARG API_URL_PROD=https://some-domain.com/api/

# Base-Stage für den gemeinsamen Kontext
FROM node:22-alpine3.22 AS builder
WORKDIR /app

# Die Argumente in die ENV aufnehmen (dynamisch zur Build-Zeit)
# ARG API_URL_DEV
# ARG API_URL_PROD

# # Die Variable in die ENV aufnehmen (dynamisch zur Build-Zeit)
# ENV VITE_API_URL_DEV=$API_URL_DEV
# ENV VITE_API_URL_PROD=$API_URL_PROD

# Abhängigkeiten installieren
COPY package.json package-lock.json ./
RUN npm ci

# Source-Code kopieren
COPY . .

# Build ausführen
RUN npm run build

# Runner-Stage
FROM node:22-alpine3.22 AS runner
WORKDIR /app

# Die Argumente in die ENV aufnehmen
# ARG API_URL_DEV
# ARG API_URL_PROD

# Die Variable in die ENV aufnehmen
# ENV VITE_API_URL_DEV=$API_URL_DEV
# ENV VITE_API_URL_PROD=$API_URL_PROD

# Build-Ergebnis übernehmen
COPY --from=builder /app/.output .

# Serve installieren und Port freigeben
EXPOSE 3000

CMD ["node", "server/index.mjs"]