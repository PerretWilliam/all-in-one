# 🔄 All-in-One Converter

An all-in-one converter that lets you transform video, audio and image files, and download/convert YouTube videos to audio or video formats.

![Logo](./img/logo.png)

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
