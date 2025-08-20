// backend/plugins/multipart.ts
import fp from "fastify-plugin";
import multipart from "@fastify/multipart";

/**
 * Register the multipart plugin with sensible upload limits.
 * - fileSize: 1 GB
 * - single file, up to 10 form fields
 */
export default fp(async (app) => {
  await app.register(multipart, {
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1 GB
      files: 1,
      fields: 10,
    },
  });
});
