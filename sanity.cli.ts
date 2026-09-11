/**
 * Config for the Sanity command line (`npx sanity ...`), used for CORS
 * origins, datasets and tokens. Reads .env.local so the project id does not
 * have to be typed on every command.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineCliConfig } from "sanity/cli";

for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    const [, key, raw] = match;
    const value = /^(["']).*\1$/.test(raw) ? raw.slice(1, -1) : raw;
    if (!(key in process.env)) process.env[key] = value;
  }
}

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || undefined,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
});
