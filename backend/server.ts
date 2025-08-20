/**
 * backend/server.ts
 *
 * Fastify server bootstrap: register plugins, ensure storage directories,
 * mount conversion routes and expose a simple healthcheck.
 */

import Fastify from "fastify";

// Local plugins
import staticPlugin from "./plugins/static.js";
import corsPlugin from "./plugins/cors.js";
import multipartPlugin from "./plugins/multipart.js";

// Storage helpers
import { ensureDirs } from "./lib/storage.js";

// Route handlers
import audioRoutes from "./routes/audio.js";
import videoRoutes from "./routes/video.js";
import ytdlAudioRoutes from "./routes/ytdlAudio.js";
import ytdlVideoRoutes from "./routes/ytdlVideo.js";

// Server configuration
const ORIGIN = process.env.FRONT_ORIGIN || "http://localhost:5173";
const PORT = Number(process.env.PORT || 3001);

async function buildServer() {
  const app = Fastify({ logger: true });

  // Register plugins
  await app.register(corsPlugin, {
    origin: ORIGIN,
  });
  await app.register(staticPlugin);
  await app.register(multipartPlugin);

  // Ensure local storage directories exist
  await ensureDirs();

  // Routes
  await app.register(audioRoutes, { prefix: "/audio" });
  await app.register(videoRoutes, { prefix: "/video" });
  await app.register(ytdlAudioRoutes, { prefix: "/youtube" });
  await app.register(ytdlVideoRoutes, { prefix: "/youtube" });

  // Healthcheck
  app.get("/health", async () => ({ ok: true }));

  return app;
}

const app = await buildServer();
app.listen({ port: PORT }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`API on ${address}`);
});
