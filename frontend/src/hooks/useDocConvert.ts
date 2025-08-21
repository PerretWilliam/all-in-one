// src/components/doc/useDocConvert.ts
import { useState } from "react";
import { postConvert } from "@/lib/api";

export type DocFormat = "pdf" | "docx" | "odt" | "rtf" | "html" | "txt";

export function useDocConvert() {
  const [busy, setBusy] = useState(false);
  const [outUrl, setOutUrl] = useState<string | null>(null);

  async function convert(file: File, target: DocFormat) {
    setBusy(true);
    setOutUrl(null);
    try {
      const headers: Record<string, string> = { "x-target": target };
      const blob = await postConvert("/doc/convert", file, headers);
      setOutUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
    }
  }

  return { busy, outUrl, setOutUrl, convert };
}
