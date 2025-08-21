// backend/plugins/multipart.ts
import fp from "fastify-plugin";
import multipart from "@fastify/multipart";

/**
 * Register the multipart plugin.
 */
export default fp(async (app) => {
  await app.register(multipart);
});
