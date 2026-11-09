/**
 * Local test mode — `npm run demo` from the project root.
 *
 * Runs the whole site on this computer with no MongoDB account or settings:
 *   1. starts a private MongoDB on this computer (data kept in server/.demo-db,
 *      so trips you add are still there next time),
 *   2. creates the admin login and 5 sample trips the first time,
 *   3. starts the API on http://localhost:4000,
 *   4. starts the website on http://localhost:5173.
 *
 * Photos uploaded in admin are saved to server/uploads (no Cloudinary needed).
 * Press Ctrl+C to stop. Delete the server/.demo-db folder to start fresh.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

const SERVER_DIR = path.resolve(__dirname, '..');
const CLIENT_DIR = path.resolve(SERVER_DIR, '..', 'client');
const DB_DIR = path.join(SERVER_DIR, '.demo-db');
const SEEDED_MARKER = path.join(DB_DIR, '.seeded');

const children: ChildProcess[] = [];

function run(command: string, args: string[], cwd: string): ChildProcess {
  // shell: true so `npm`/`npx` resolve on Windows too.
  const child = spawn(command, args, { cwd, stdio: 'inherit', shell: true, env: process.env });
  children.push(child);
  return child;
}

function runToEnd(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    run(command, args, cwd).on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} exited with ${code}`)),
    );
  });
}

async function main() {
  mkdirSync(DB_DIR, { recursive: true });

  console.log('\n[demo] starting local database (first run downloads MongoDB once, ~1–2 min)…');
  const mongo = await MongoMemoryServer.create({
    instance: { dbPath: DB_DIR, storageEngine: 'wiredTiger', dbName: 'expediva' },
  });

  // Test-mode settings. These win over server/.env, so the demo never touches
  // a real database. Admin login can still be changed via ADMIN_EMAIL/ADMIN_PASSWORD.
  process.env.MONGODB_URI = mongo.getUri('expediva');
  process.env.NODE_ENV = 'development';
  process.env.PORT = '4000';
  process.env.CLIENT_ORIGIN = 'http://localhost:5173';
  process.env.PUBLIC_SITE_URL = 'http://localhost:5173';
  process.env.JWT_SECRET ||= 'local-demo-secret-not-for-production';
  process.env.ADMIN_EMAIL ||= 'admin@expediva.in';
  process.env.ADMIN_PASSWORD ||= 'changeme123';

  const firstRun = !existsSync(SEEDED_MARKER);
  console.log(firstRun ? '[demo] adding admin login + sample trips…' : '[demo] keeping your saved trips…');
  // --keep on later runs: refresh the admin login, never wipe the trips you added.
  await runToEnd('npx', ['tsx', 'src/seed.ts', ...(firstRun ? [] : ['--keep'])], SERVER_DIR);
  if (firstRun) writeFileSync(SEEDED_MARKER, new Date().toISOString());

  // Start the API in this process (it reads the settings above).
  await import('./index');

  // Start the website.
  run('npm', ['run', 'dev'], CLIENT_DIR);

  setTimeout(() => {
    console.log(`
  ───────────────────────────────────────────────────────────
   Expediva test mode is running

   Website:  http://localhost:5173
   Admin:    http://localhost:5173/admin/login
             ${process.env.ADMIN_EMAIL}  /  ${process.env.ADMIN_PASSWORD}

   Press Ctrl+C to stop. Your trips are kept for next time.
  ───────────────────────────────────────────────────────────
`);
  }, 2500);

  const stop = async () => {
    for (const child of children) child.kill();
    await mongo.stop({ doCleanup: false }).catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((err) => {
  console.error('\n[demo] could not start:', err?.message ?? err);
  console.error(
    '[demo] If this is the database download, check your internet (try a phone hotspot) and run it again.',
  );
  for (const child of children) child.kill();
  process.exit(1);
});
