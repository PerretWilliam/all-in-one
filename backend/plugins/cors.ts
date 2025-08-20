// backend/plugins/cors.ts
import fp from "fastify-plugin";
import cors from "@fastify/cors";

type CORSOpts = { origin: string };

/**
 * Fastify plugin that registers CORS with a controlled set of headers and
 * methods. The `origin` is provided by the caller via plugin options.
 */
export default fp<CORSOpts>(async (app, opts) => {
  await app.register(cors, {
    origin: opts.origin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "x-target",
      "x-bitrate",
      "x-crf",
      "x-preset",
      "x-audio-kbps",
      "x-max-w",
      "x-max-h",
      "x-fps",
    ],
  });
});
