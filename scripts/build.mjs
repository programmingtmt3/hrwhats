// `npm run build`: builds the static site into out/.
//
// Hostinger's Next.js preset renames next.config.* (to "<hash>.next.config.*") and
// writes its own config without `output: "export"`, so next build writes no pages to
// out/. The real config lives in next.base.ts; restore the entry file before building.
// Plain .mjs (not .ts) so it runs on any Node version the host picks.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";

const ENTRY = `// The real config lives in next.base.ts. scripts/build.mjs restores this file
// if a hosting preset replaces it, so keep it exactly as-is.
export { default } from "./next.base";
`;

const current = existsSync("next.config.ts") ? readFileSync("next.config.ts", "utf8") : "";
if (current.replace(/\r\n/g, "\n") !== ENTRY) {
  console.log("▶ next.config.ts was replaced by the build environment; restoring the project config");
  writeFileSync("next.config.ts", ENTRY);
}
// Next.js prefers next.config.js/.mjs over .ts, so any other entry file would win.
for (const file of readdirSync(".")) {
  if (/^next\.config\.(js|cjs|mjs|mts)$/.test(file)) {
    console.log(`▶ Removing extra ${file} so only the project config is used`);
    unlinkSync(file);
  }
}

for (const key of Object.keys(process.env).filter((k) => /^NEXT_PRIVATE_(STANDALONE|OUTPUT)/.test(k))) {
  console.log(`▶ Ignoring ${key} so the static export is not overridden`);
  delete process.env[key];
}

function run(command) {
  const result = spawnSync(command, { stdio: "inherit", shell: true, env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Webpack, not Turbopack: Turbopack builds crashed on Hostinger (CSS-loader subprocess).
run("npx next build --webpack");

if (!existsSync("out/index.html")) {
  console.error('✖ next build finished but out/index.html is missing. next.base.ts must keep output: "export".');
  process.exit(1);
}

run("npx next-image-export-optimizer");
console.log("✓ Static site written to out/");
