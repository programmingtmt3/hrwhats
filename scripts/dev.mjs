// `npm run dev`: builds the content once, then runs Velite (watching content/) and Next together.
import { spawn, spawnSync } from "node:child_process";

const first = spawnSync("npx velite build --strict", { stdio: "inherit", shell: true });
if (first.status !== 0) process.exit(first.status ?? 1);

const children = ["npx velite dev", "npx next dev"].map((command) =>
  spawn(command, { stdio: "inherit", shell: true }),
);
const stop = () => children.forEach((child) => child.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
children.forEach((child) => child.on("exit", stop));
