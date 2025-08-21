// backend/plugins/cors.ts
import fp from "fastify-plugin";
import cors from "@fastify/cors";

export default fp(async (app) => {
  const allowed = new Set([
    process.env.FRONT_ORIGIN ?? "",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  await app.register(cors, {
    hook: "onRequest", // run early so OPTIONS never hits your routes
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl/health checks
      cb(null, allowed.has(origin));
    },
    methods: ["GET", "POST", "OPTIONS"],
    // add every custom header you use from the frontend (case-insensitive)
    allowedHeaders: [
      "Content-Type",
      "X-Bitrate",
      "X-Audio-Kbps",
      "X-Target",
      "X-CRF",
      "X-Preset",
      "X-Max-W",
      "X-Max-H",
      "X-FPS",
    ],
    // lets the browser read filename etc.
    exposedHeaders: ["Content-Disposition"],
    credentials: false,
    maxAge: 86400,
    strictPreflight: false,
    preflightContinue: false, // plugin replies 204 to OPTIONS
  });
});
