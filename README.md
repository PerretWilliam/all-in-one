<h1 align="center">🔄 All-in-One Converter</h1>

<p align="center">
  <b>Convert • Compress • Transform</b> your <br>
  🎵 Audio • 🎬 Video • 🖼️ Images • 📄 Documents <br>
  with a sleek interface and powerful backend.
</p>

<p align="center">
  <img src="./img/logo.png" alt="All-in-One Converter Logo" width="150" />
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="https://ffmpeg.org/"><img src="https://img.shields.io/badge/FFmpeg-ready-blue?logo=ffmpeg&logoColor=white" alt="FFmpeg" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-frontend-yellow?logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-supported-2496ED?logo=docker&logoColor=white" alt="Docker" /></a>
</p>

---

## 🚀 Features

- 🎵 YouTube → Audio conversion (MP3, AAC, OGG, Opus, WAV)
- 🎬 YouTube → Video conversion (MP4, WebM, MKV, MOV, AVI, FLV)
- 📂 Local file conversions:
  - Video → Video (change format, quality, resolution, etc.)
  - Audio → Audio (change format, bitrate, etc.)
  - Images → (JPEG, PNG, WebP, AVIF, etc.)a
- ⚡ Modern frontend with React + Vite + TailwindCSS + shadcn/ui
- 🛠️ Optional backend (Node.js + Fastify/Express + FFmpeg) for heavier jobs and YouTube downloading

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/PerretWilliam/AllInOne.git
cd AllInOne
```

### 2. Install dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../
npm install
```

---

## **▶️ Run locally with Docker (Backend) + Vite (Frontend)**

### **1. Start the backend (Docker only)**

From the project root:

```
docker compose up --build
```

By default the backend API runs at:

👉 http://localhost:3001

Logs will be visible in your terminal.

You can stop it anytime with:

```
docker compose down
```

### **2. Start the frontend**

```
# In frontend folder
npm run dev
```

By default the frontend runs at:

👉 http://localhost:5173

---

## 🛠️ Docker Cheatsheet

- **See logs**

  ```bash
  docker compose logs -f
  ```

- **Rebuild after code changes**

  ```bash
  docker compose up --build
  ```

- **Remove containers, images and volumes (free disk space)**

  ```bash
  docker system prune -a --volumes
  ```

- **Remove specific volumes**

cl

- **Check Docker disk usage**

  ```bash
  docker system df
  ```

- **Check volumes**

  ```bash
  docker volume ls
  ```

- **Check used disk space**

  ```bash
  docker system df # -v for verbose
  ```

---

## 🖼️ UI screenshots

![image-conv](./img/image-conv.png)
![ytdlVideo-conv](./img/ytdlVideo-conv.png)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file for details.
