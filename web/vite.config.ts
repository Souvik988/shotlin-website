import { defineConfig, type Plugin } from "vite";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const SKIP = new Set(["node_modules", "dist", "public", "partials", "src", "scripts"]);

/** every *.html under the project root becomes a page (multi-page build) */
function pages(dir = root, out: Record<string, string> = {}) {
  for (const f of readdirSync(dir)) {
    if (SKIP.has(f) || f.startsWith(".")) continue;
    const p = resolve(dir, f);
    if (statSync(p).isDirectory()) pages(p, out);
    else if (f.endsWith(".html")) out[relative(root, p).split(sep).join("/").replace(/\.html$/, "")] = p;
  }
  return out;
}

/** <!-- @include nav.html --> → contents of partials/nav.html */
function includes(): Plugin {
  const inc = (html: string, depth = 0): string =>
    depth > 4 ? html : html.replace(/<!--\s*@include\s+([\w.-]+)\s*-->/g, (_, f) => inc(readFileSync(resolve(root, "partials", f), "utf8"), depth + 1));
  return {
    name: "shotlin-html-includes",
    transformIndexHtml: { order: "pre", handler: (html) => inc(html) },
    handleHotUpdate({ file, server }) {
      if (file.includes(`${sep}partials${sep}`) || file.includes("/partials/")) server.ws.send({ type: "full-reload" });
    },
  };
}

export default defineConfig({
  plugins: [includes()],
  build: { rollupOptions: { input: pages() } },
});
