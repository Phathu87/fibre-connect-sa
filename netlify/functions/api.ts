import { randomUUID } from "node:crypto";
import { createApp } from "../../server/app.js";
import { EnvironmentConfigurationError, loadEnv } from "../../server/config/env.js";

let app: ReturnType<typeof createApp> | undefined;

type NetlifyEvent = {
  httpMethod: string;
  path: string;
  rawQuery?: string;
  headers: Record<string, string | undefined>;
  body?: string | null;
  isBase64Encoded?: boolean;
};
type InjectMethod = "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT";

export async function handler(event: NetlifyEvent) {
  try {
    const env = loadEnv();
    const requestHost = Object.entries(event.headers).find(([name]) => name.toLowerCase() === "host")?.[1];
    if (requestHost && requestHost !== new URL(env.PUBLIC_APP_URL).host) {
      throw new EnvironmentConfigurationError(["PUBLIC_APP_URL"]);
    }
    app ??= createApp(env);
  } catch (error) {
    if (!(error instanceof EnvironmentConfigurationError)) throw error;
    const requestId = randomUUID();
    const isReadiness = event.path === "/api/ready";
    return {
      statusCode: 503,
      headers: { "content-type": "application/json; charset=utf-8", "x-request-id": requestId },
      multiValueHeaders: {},
      body: JSON.stringify(isReadiness
        ? { status: "not_ready", reason: "environment_configuration", requestId }
        : { error: { code: "ENVIRONMENT_NOT_READY", message: "Service environment is not ready", requestId } }),
    };
  }
  await app.ready();
  const payload = event.body ? (event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body) : undefined;
  const response = await app.inject({
    method: event.httpMethod.toUpperCase() as InjectMethod,
    url: `${event.path}${event.rawQuery ? `?${event.rawQuery}` : ""}`,
    headers: Object.fromEntries(Object.entries(event.headers).filter((entry): entry is [string, string] => typeof entry[1] === "string")),
    ...(payload !== undefined ? { payload } : {}),
  });
  const headers: Record<string, string> = {};
  const multiValueHeaders: Record<string, string[]> = {};
  for (const [name, value] of Object.entries(response.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) multiValueHeaders[name] = value.map(String);
    else headers[name] = String(value);
  }
  return { statusCode: response.statusCode, headers, multiValueHeaders, body: response.body };
}
