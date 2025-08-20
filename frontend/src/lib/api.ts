/**
 * lib/api.ts
 *
 * Small helper functions for communicating with the backend API.
 * - `API_BASE` is derived from the environment with a sensible default.
 * - `postConvert` uploads a file as multipart/form-data and returns the
 *   response blob on success.
 * - `postJson` posts JSON and returns the fetch Response (may be a binary
 *   response in some endpoints) — callers may convert it to a blob.
 * - `postJsonBlob` posts JSON and returns a Blob, asserting the response is OK.
 */

import { API } from "@/lib/constants";

/**
 * postConvert
 * - endpoint: one of the server convert endpoints
 * - file: the file to upload
 * - headers: additional headers used to pass conversion options
 *
 * Returns a Blob containing the converted file on success. Throws with a
 * helpful error message on non-OK responses.
 */
export async function postConvert(
  endpoint: "/audio/convert" | "/video/convert",
  file: File,
  headers: Record<string, string>
): Promise<Blob> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API}${endpoint}`, {
    method: "POST",
    body: form,
    headers,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend error ${res.status}: ${text}`);
  }
  return await res.blob();
}

/**
 * postJson
 * - Posts JSON to the given path and returns the underlying Response.
 *
 * Note: some endpoints in this project return binary data even when called
 * via a JSON POST; callers that expect a blob should call `res.blob()` on
 * the returned Response. We intentionally return the Response here instead
 * of parsing JSON so callers can decide how to consume it.
 */
export async function postJson<T = unknown>(
  path: string,
  data: unknown
): Promise<T> {
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${t}`);
  }
  // @ts-expect-error - deliberately returning Response which may be used as
  // a blob by some callers; keep the current behavior.
  return res;
}

/**
 * postJsonBlob
 * - Convenience helper: posts JSON and converts the underlying Response to a
 *   Blob, ensuring the response is OK first.
 */
export async function postJsonBlob(path: string, body: unknown): Promise<Blob> {
  const res = await postJson<Response>(path, body);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.blob();
}
