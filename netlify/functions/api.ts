import { createApp } from "../../server/app.js";
import { loadEnv } from "../../server/config/env.js";

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
  app ??= createApp(loadEnv());
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
