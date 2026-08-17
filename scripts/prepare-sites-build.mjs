import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const buildDir = join(process.cwd(), "dist");
const clientDir = join(buildDir, "client");
const serverDir = join(buildDir, "server");

await rm(clientDir, { force: true, recursive: true });
await rm(serverDir, { force: true, recursive: true });
await mkdir(clientDir, { recursive: true });

for (const entry of await readdir(buildDir)) {
  if (entry === "client" || entry === "server") {
    continue;
  }

  await rename(join(buildDir, entry), join(clientDir, entry));
}

await mkdir(serverDir, { recursive: true });
await writeFile(
  join(serverDir, "index.js"),
  `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404 || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const url = new URL(request.url);

    if (url.pathname.split("/").pop()?.includes(".")) {
      return response;
    }

    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  },
};
`,
  "utf8"
);
