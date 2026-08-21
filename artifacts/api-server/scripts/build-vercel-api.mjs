// Bundles artifacts/api-server/src/app.ts into a single file at api/index.mjs
// so Vercel's Node.js function builder gets a plain, dependency-free bundle
// instead of having to resolve pnpm workspace packages itself.
//
// Deliberately bundles app.ts, not index.ts: index.ts calls app.listen()
// and reads a required PORT env var, both of which are wrong for a
// serverless function (Vercel owns the listener, and there is no PORT to
// set). app.ts just builds and exports the Express app, which is exactly
// what Vercel's "export the app instance" convention expects.
//
// Run via `pnpm run build:vercel` (see root package.json). Not part of the
// regular `pnpm run build`, so it doesn't affect Replit/Termux workflows.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";

globalThis.require = createRequire(import.meta.url);

// This file lives at artifacts/api-server/scripts/build-vercel-api.mjs.
const apiServerDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(path.dirname(apiServerDir));
const entry = path.join(apiServerDir, "src/app.ts");
const outdir = path.join(repoRoot, "api");
// esbuild-plugin-pino emits its own worker entry files (pino-pretty.mjs
// etc.) alongside the main bundle, so this needs `outdir` rather than a
// single `outfile` even though there is only one real entry point.
const outfile = path.join(outdir, "index.mjs");

await esbuild({
  entryPoints: { index: entry },
  platform: "node",
  bundle: true,
  format: "esm",
  outdir,
  outExtension: { ".js": ".mjs" },
  logLevel: "info",
  // Mirrors artifacts/api-server/build.mjs so both build paths behave the
  // same way for native/unbundleable packages.
  external: [
    "*.node",
    "sharp",
    "better-sqlite3",
    "sqlite3",
    "canvas",
    "bcrypt",
    "argon2",
    "fsevents",
    "re2",
    "farmhash",
    "xxhash-addon",
    "bufferutil",
    "utf-8-validate",
    "ssh2",
    "cpu-features",
    "dtrace-provider",
    "isolated-vm",
    "lightningcss",
    "pg-native",
    "oracledb",
    "mongodb-client-encryption",
    "nodemailer",
    "handlebars",
    "knex",
    "typeorm",
    "protobufjs",
    "onnxruntime-node",
    "@tensorflow/*",
    "@prisma/client",
    "@mikro-orm/*",
    "@grpc/*",
    "@swc/*",
    "@aws-sdk/*",
    "@azure/*",
    "@opentelemetry/*",
    "@google-cloud/*",
    "@google/*",
    "googleapis",
    "firebase-admin",
    "@parcel/watcher",
    "@sentry/profiling-node",
    "@tree-sitter/*",
    "aws-sdk",
    "classic-level",
    "dd-trace",
    "ffi-napi",
    "grpc",
    "hiredis",
    "kerberos",
    "leveldown",
    "miniflare",
    "mysql2",
    "newrelic",
    "odbc",
    "piscina",
    "realm",
    "ref-napi",
    "rocksdb",
    "sass-embedded",
    "sequelize",
    "serialport",
    "snappy",
    "tinypool",
    "usb",
    "workerd",
    "wrangler",
    "zeromq",
    "zeromq-prebuilt",
    "playwright",
    "puppeteer",
    "puppeteer-core",
    "electron",
  ],
  sourcemap: false,
  plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
  banner: {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
  },
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

console.log(`Bundled Vercel API function -> ${path.relative(repoRoot, outfile)}`);
