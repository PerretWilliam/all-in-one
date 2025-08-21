import type {
  AudioFormat,
  DocFormat,
  ImageFormat,
  VideoFormat,
} from "@/lib/types";

// APP Utils
export const APP_NAME = "All In One";
export const REPO_URL = "https://github.com/PerretWilliam/AllInOne";
export const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Audio
export const AUDIO_FORMATS: AudioFormat[] = [
  "mp3",
  "aac",
  "ogg",
  "opus",
  "wav",
];

// Video
export const VIDEO_FORMATS: VideoFormat[] = [
  "mp4",
  "webm",
  "mkv",
  "avi",
  "mov",
  "flv",
];

// Image
export const IMAGE_FORMATS: ImageFormat[] = ["jpeg", "png", "webp", "avif"];

// Document
export const DOC_FORMATS: DocFormat[] = [
  "pdf",
  "docx",
  "odt",
  "rtf",
  "html",
  "txt",
];
