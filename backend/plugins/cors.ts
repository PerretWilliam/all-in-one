// backend/plugins/cors.ts
// Configure CORS for the backend. Developer-focused notes are below.

import fp from "fastify-plugin";
import cors from "@fastify/cors";

export default fp(async (app) => {
  // Whitelisted origins allowed to access the API. Add other dev or prod
  // origins here. Using a Set makes membership checks fast and explicit.
  const allowed = new Set([
    process.env.FRONT_ORIGIN ?? "",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  await app.register(cors, {
    // Use the onSend hook so CORS headers are applied to the final
    // response object. This ensures headers are present even for streamed
    // responses (for example the ZIP streaming endpoints).
    hook: "onSend",

    // Custom origin checker: permit requests from no-origin contexts (curl,
    // server health checks) and only allow explicitly whitelisted origins.
    origin(origin, cb) {
      if (!origin) return cb(null, true); // allow requests without an Origin
      cb(null, allowed.has(origin));
    },

    // Allowed HTTP methods for CORS preflight and actual requests.
    methods: ["GET", "POST", "OPTIONS"],

    // Headers the client may send in CORS requests. Keep this list tightly
    // scoped to the custom headers the frontend actually uses.
    allowedHeaders: [
      "Content-Type",
      "X-Target",
      "X-Bitrate",
      "X-Audio-Kbps",
      "X-CRF",
      "X-Preset",
      "X-Max-W",
      "X-Max-H",
      "X-FPS",
      "X-Quality",
      "X-Keep-Aspect",
    ],

    // Expose Content-Disposition so the browser can read the suggested
    // filename when downloading streamed attachments.
    exposedHeaders: ["Content-Disposition"],

    credentials: false,
    maxAge: 86400,

    // Don't be strict about preflight; allow clients to request preflight
    // with a non-standard Origin value. The plugin will respond with 204
    // to OPTIONS requests by default when preflight is handled.
    strictPreflight: false,
    preflightContinue: false,
  });
});
