// backend/plugins/static.ts

import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// Resolve this module's directory (ESM friendly)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NODE_MODULES = resolve(__dirname, "../node_modules");

function must(path: string) {
  if (!existsSync(path)) {
    // Fail early with a clear error message
    throw new Error(`Static root does not exist: ${path}`);
  }
  return path;
}

export default fp(async (app) => {
  // jSquash encoders (Emscripten builds)
  await app.register(fastifyStatic, {
    root: must(resolve(NODE_MODULES, "@jsquash/webp/codec/enc")),
    prefix: "/vendor/jsquash/webp/",
    decorateReply: false,
  });
  await app.register(fastifyStatic, {
    root: must(resolve(NODE_MODULES, "@jsquash/avif/codec/enc")),
    prefix: "/vendor/jsquash/avif/",
    decorateReply: false,
  });
  await app.register(fastifyStatic, {
    root: must(resolve(NODE_MODULES, "@jsquash/jpeg/codec/enc")),
    prefix: "/vendor/jsquash/jpeg/",
    decorateReply: false,
  });

  // jSquash PNG (wasm-bindgen build)
  await app.register(fastifyStatic, {
    root: must(resolve(NODE_MODULES, "@jsquash/png/codec/pkg")),
    prefix: "/vendor/jsquash/png/",
    decorateReply: false,
  });

  // Optional debug endpoint that reports the resolved static roots and sample
  // WASM paths. Useful during local development when codec artifacts are
  // expected to be served from node_modules.
  app.get("/__static-debug", async () => ({
    NODE_MODULES,
    roots: {
      webp: resolve(NODE_MODULES, "@jsquash/webp/codec/enc"),
      avif: resolve(NODE_MODULES, "@jsquash/avif/codec/enc"),
      jpeg: resolve(NODE_MODULES, "@jsquash/jpeg/codec/enc"),
      png: resolve(NODE_MODULES, "@jsquash/png/codec/pkg"),
    },
    sample: {
      webp: "/vendor/jsquash/webp/webp_enc_simd.wasm",
      avif: "/vendor/jsquash/avif/avif_enc.wasm",
      jpeg: "/vendor/jsquash/jpeg/mozjpeg_enc.wasm",
      png: "/vendor/jsquash/png/squoosh_png_bg.wasm",
    },
  }));
});
