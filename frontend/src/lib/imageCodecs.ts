/**
 * lib/imageCodecs.ts
 *
 * Small helpers to decode, optionally resize, and encode images in the
 * browser using the Squoosh/jsquash wasm codecs and a JS resize routine.
 *
 * Exports:
 * - `decodeToImageData` - convert an ArrayBuffer into ImageData
 * - `maybeResize` - resize ImageData with optional aspect preservation
 * - `encodeByTarget` - encode ImageData to webp/avif/jpeg/png using wasm codecs
 */

import encodeWebp, { init as initWebp } from "@jsquash/webp/encode";
import encodeAvif, { init as initAvif } from "@jsquash/avif/encode";
import encodeJpeg, { init as initJpeg } from "@jsquash/jpeg/encode";
import encodePng, { init as initPng } from "@jsquash/png/encode";
import jsResize from "@jsquash/resize";
import type { ImageFormat } from "@/lib/types";
import { API } from "@/lib/constants";

// Helper: fetch a URL as ArrayBuffer for codecs that expect binary input
async function fetchAB(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WASM fetch failed: ${res.status} ${url}`);
  return await res.arrayBuffer();
}

// WebP has SIMD and non-SIMD builds; try SIMD first and fall back if it fails
async function initWebpWithFallback() {
  try {
    return await initWebp(
      await fetchAB(`${API}/vendor/jsquash/webp/webp_enc_simd.wasm`)
    );
  } catch {
    return await initWebp(
      await fetchAB(`${API}/vendor/jsquash/webp/webp_enc.wasm`)
    );
  }
}

// One-time initialization guard for all wasm codecs
let codecsReady = false;
async function ensureCodecsReady() {
  if (codecsReady) return;
  await Promise.all([
    initWebpWithFallback(),
    initAvif(await fetchAB(`${API}/vendor/jsquash/avif/avif_enc.wasm`)),
    initJpeg(await fetchAB(`${API}/vendor/jsquash/jpeg/mozjpeg_enc.wasm`)),
    // PNG (wasm-bindgen) prefers a URL string instead of an ArrayBuffer
    initPng(
      `${API}/vendor/jsquash/png/squoosh_png_bg.wasm` as unknown as string
    ),
  ]);
  codecsReady = true;
}

/**
 * Decode any browser-supported image (bytes) into ImageData using an
 * OffscreenCanvas. The function returns pixel data and dimensions.
 */
export async function decodeToImageData(
  input: ArrayBuffer
): Promise<ImageData> {
  const blob = new Blob([input]);
  const bmp = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);
  const data = ctx.getImageData(0, 0, bmp.width, bmp.height);
  bmp.close();
  return data;
}

/**
 * maybeResize
 * - img: source ImageData
 * - opts: optional max width/height and keepAspect flag
 *
 * Returns the original ImageData when no constraints are provided. Otherwise
 * it uses a JS resize routine to produce a new ImageData with the requested
 * dimensions.
 */
export async function maybeResize(
  img: ImageData,
  opts: { maxWidth?: number | ""; maxHeight?: number | ""; keepAspect: boolean }
): Promise<ImageData> {
  const { maxWidth, maxHeight, keepAspect } = opts;
  const wantW = typeof maxWidth === "number" && maxWidth > 0;
  const wantH = typeof maxHeight === "number" && maxHeight > 0;
  if (!wantW && !wantH) return img;

  let targetW = img.width;
  let targetH = img.height;

  if (keepAspect) {
    const rw = wantW ? (maxWidth as number) / img.width : Infinity;
    const rh = wantH ? (maxHeight as number) / img.height : Infinity;
    const scale = Math.min(rw, rh);
    if (!Number.isFinite(scale)) return img;
    targetW = Math.max(1, Math.round(img.width * scale));
    targetH = Math.max(1, Math.round(img.height * scale));
  } else {
    targetW = wantW ? (maxWidth as number) : img.width;
    targetH = wantH ? (maxHeight as number) : img.height;
  }

  const out = await jsResize(img, {
    width: targetW,
    height: targetH,
    premultiply: true,
    linearRGB: true,
  });
  return out;
}

/**
 * encodeByTarget
 * - Encode ImageData to the requested format using the wasm codecs.
 * - `quality` is interpreted per-encoder (1..100 where applicable).
 */
export async function encodeByTarget(
  img: ImageData,
  fmt: ImageFormat,
  quality: number
): Promise<Blob> {
  await ensureCodecsReady(); // ensure wasm codecs are loaded (one-time)

  if (fmt === "webp") {
    const bin = await encodeWebp(img, { quality });
    return new Blob([bin], { type: "image/webp" });
  }
  if (fmt === "avif") {
    const bin = await encodeAvif(img, { quality });
    return new Blob([bin], { type: "image/avif" });
  }
  if (fmt === "jpeg") {
    const q = Math.min(100, Math.max(1, quality));
    const bin = await encodeJpeg(img, { quality: q });
    return new Blob([bin], { type: "image/jpeg" });
  }
  const bin = await encodePng(img, {});
  return new Blob([bin], { type: "image/png" });
}
