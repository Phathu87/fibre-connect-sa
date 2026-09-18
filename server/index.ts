import "dotenv/config";
import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { disconnectDatabase } from "./db/client.js";

const env = loadEnv();
const app = createApp(env);

async function shutdown(signal: string) {
  app.log.info({ signal }, "shutting down");
  await app.close();
  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.fatal({ err: error }, "server failed to start");
  process.exit(1);
}
