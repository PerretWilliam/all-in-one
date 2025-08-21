// backend/lib/docs.ts
// Uses the npm "soffice" wrapper when possible, and falls back to the raw CLI
// for formats not covered by the wrapper's typed API.

import { basename, extname, join, dirname } from "path";
import { promises as fs } from "fs";
import { spawn } from "child_process";
import { convertTo, is_soffice_installed, ChildProcessError } from "soffice";

export type DocTarget = "pdf" | "docx" | "odt" | "rtf" | "html" | "txt";

export function docMime(target: DocTarget) {
  switch (target) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "odt":
      return "application/vnd.oasis.opendocument.text";
    case "rtf":
      return "application/rtf";
    case "html":
      return "text/html";
    case "txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

// --- Small helpers ---------------------------------------------------------

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

// Try to guess the main output created by LibreOffice when multiple files appear (e.g. HTML + assets)
async function findProducedFile(
  outDir: string,
  base: string,
  target: DocTarget
) {
  const primary = join(outDir, `${base}.${target}`);
  if (await fileExists(primary)) return primary;

  const list = await fs.readdir(outDir);
  const candidate = list.find(
    (f) => f.startsWith(base) && f.endsWith("." + target)
  );
  return candidate ? join(outDir, candidate) : null;
}

// --- Raw CLI fallback (for formats not in the wrapper typings) -------------
async function runSofficeCli(
  inPath: string,
  outDir: string,
  target: DocTarget,
  onLog?: (l: string) => void
) {
  await ensureDir(outDir);

  const args = [
    "--headless",
    "--convert-to",
    target,
    "--outdir",
    outDir,
    inPath,
  ];

  const code = await new Promise<number>((resolve) => {
    const p = spawn("soffice", args);
    p.stdout.on("data", (d) => onLog?.(d.toString()));
    p.stderr.on("data", (d) => onLog?.(d.toString()));
    p.on("close", (c) => resolve(c ?? 1));
    p.on("error", () => resolve(1));
  });

  if (code !== 0) {
    throw new Error(`soffice CLI failed with code ${code}`);
  }

  const base = basename(inPath, extname(inPath));
  const produced = await findProducedFile(outDir, base, target);
  if (!produced) {
    throw new Error("soffice CLI: could not locate produced output");
  }
  return produced;
}

// --- Public: convertWithSoffice -------------------------------------------

/**
 * Convert one file using the npm "soffice" wrapper when possible.
 * Falls back to the raw `soffice` CLI for targets not covered by the wrapper typings (e.g. rtf, txt).
 *
 * Returns the absolute path to the produced file (inside outDir).
 * Throws on error.
 */
export async function convertWithSoffice(
  inPath: string,
  outDir: string,
  target: DocTarget,
  onLog?: (l: string) => void
) {
  await ensureDir(outDir);

  const base = basename(inPath, extname(inPath));
  const expected = join(outDir, `${base}.${target}`);

  // Formats explicitly supported by the wrapper typings:
  const WRAPPER_FORMATS = new Set([
    "pdf",
    "html",
    "doc",
    "docx",
    "odt",
    "odp",
    "pptx",
    "ppt",
    "ods",
    "xlsx",
    "xls",
  ]);

  // If wrapper supports the target, use it (it returns the absolute path to the output)
  if (WRAPPER_FORMATS.has(target)) {
    try {
      const outputPath = await convertTo({
        input_file: inPath,
        convert_to: target as any, // cast to satisfy the wrapper type
      });
      // If wrapper wrote outside our outDir, move the file for consistency.
      if (dirname(outputPath) !== outDir) {
        await ensureDir(outDir);
        await fs.rename(outputPath, expected);
        return expected;
      }
      // Ensure the filename matches <base>.<ext> for predictability
      if (outputPath !== expected) {
        await fs.rename(outputPath, expected);
      }
      return expected;
    } catch (err) {
      // If wrapper says unsupported, fall back to raw CLI
      if (err instanceof ChildProcessError) {
        onLog?.(err.stderr || err.message);
      }

      if (!is_soffice_installed()) {
        throw new Error(
          "LibreOffice (soffice) is not available on this system. Please install LibreOffice."
        );
      }

      // Try raw CLI (covers some extra formats or edge cases)
      const produced = await runSofficeCli(inPath, outDir, target, onLog);
      // Normalise filename to expected path
      if (produced !== expected) {
        await fs.rename(produced, expected);
      }
      return expected;
    }
  }

  // For targets not in wrapper typings (rtf, txt), go straight to CLI fallback.
  if (!is_soffice_installed()) {
    throw new Error(
      "LibreOffice (soffice) is not available on this system. Please install LibreOffice."
    );
  }

  const produced = await runSofficeCli(inPath, outDir, target, onLog);
  if (produced !== expected) {
    await fs.rename(produced, expected);
  }
  return expected;
}
