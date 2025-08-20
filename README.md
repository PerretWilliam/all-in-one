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
  - Images → (JPEG, PNG, WebP, AVIF, etc.)
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

## ▶️ Run locally

### 1. Start the backend (if used)

```bash
cd backend
npm run dev
```

By default the API runs at: http://localhost:3001

### 2. Start the frontend

```bash
cd .
npm run dev
```

By default the frontend runs at: http://localhost:5173 (Vite) unless configured otherwise

---

## 🖼️ UI screenshots

![image-conv](./img/image-conv.png)
![ytdlVideo-conv](./img/ytdlVideo-conv.png)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file for details.
