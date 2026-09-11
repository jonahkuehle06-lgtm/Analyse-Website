#!/usr/bin/env node
/**
 * Hilfsskript.
 *
 *   npm run seed
 *       kopiert data/seed.json nach data/store.local.json (lokaler Testbetrieb)
 *
 *   npm run seed -- --admin-password "DeinPasswort"
 *       erzeugt den Hash fuer ADMIN_PASSWORD_HASH
 *
 *   npm run seed -- --secret
 *       erzeugt ein Zufallsgeheimnis fuer AUTH_SECRET
 */
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const scrypt = promisify(scryptCb);
const args = process.argv.slice(2);

function arg(name) {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : null;
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const password = arg("--admin-password");
if (password) {
  console.log("\nADMIN_PASSWORD_HASH=" + (await hashPassword(password)) + "\n");
  console.log("Diese Zeile in .env.local bzw. in die Projekt-Variablen übernehmen.\n");
  process.exit(0);
}

if (args.includes("--secret")) {
  console.log("\nAUTH_SECRET=" + randomBytes(48).toString("base64") + "\n");
  process.exit(0);
}

const seed = path.join(process.cwd(), "data", "seed.json");
const store = path.join(process.cwd(), "data", "store.local.json");

if (!existsSync(seed)) {
  console.error("data/seed.json fehlt. Bitte zuerst  node scripts/make-seed.mjs  ausführen.");
  process.exit(1);
}

if (existsSync(store) && !args.includes("--force")) {
  console.log("data/store.local.json existiert bereits — Abbruch (mit --force überschreiben).");
  process.exit(0);
}

copyFileSync(seed, store);
console.log("data/store.local.json aus den Beispieldaten erzeugt.");
