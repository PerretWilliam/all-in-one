# syntax=docker/dockerfile:1
FROM node:20-bullseye

# System deps: ffmpeg (video), LibreOffice (docs), fonts, curl
# yt-dlp est installé via binaire officiel (pas via apt)
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  ffmpeg \
  libreoffice \
  libreoffice-writer libreoffice-calc libreoffice-impress \
  libreoffice-common libreoffice-java-common \
  ca-certificates \
  fonts-dejavu \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Install yt-dlp (binaire officiel)
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
  -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && /usr/local/bin/yt-dlp --version

# (le reste de ton Dockerfile inchangé)
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]