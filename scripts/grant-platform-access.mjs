import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

function nowIso() {
  return new Date().toISOString();
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function makeUsername(email) {
  const local = email.split("@")[0] ?? "user";
  const normalized = local
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return normalized || `user-${randomUUID().slice(0, 8)}`;
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = randomBytes(14);
  let password = "";
  for (const byte of bytes) {
    password += alphabet[byte % alphabet.length];
  }
  return password;
}

function ensureDatabaseSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      username TEXT NOT NULL,
      avatar TEXT,
      email_verified INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_balances (
      user_id TEXT PRIMARY KEY,
      points INTEGER NOT NULL DEFAULT 5000,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS balance_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      amount INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

function ensureUserSeed(db, userId, username) {
  const timestamp = nowIso();
  db.prepare(`
    INSERT OR IGNORE INTO user_balances (user_id, points, updated_at)
    VALUES (?, 5000, ?)
  `).run(userId, timestamp);

  const existing = db.prepare(`
    SELECT id FROM balance_transactions
    WHERE user_id = ? AND type = 'credit' AND description = 'Приветственный бонус'
    LIMIT 1
  `).get(userId);

  if (!existing) {
    db.prepare(`
      INSERT INTO balance_transactions (id, user_id, type, description, amount, created_at)
      VALUES (?, ?, 'credit', 'Приветственный бонус', 5000, ?)
    `).run(randomUUID(), userId, timestamp);
  }

  const welcomeNotice = db.prepare(`
    SELECT id FROM user_notifications
    WHERE user_id = ? AND title = 'Добро пожаловать'
    LIMIT 1
  `).get(userId);

  if (!welcomeNotice) {
    db.prepare(`
      INSERT INTO user_notifications (id, user_id, title, message, type, read, created_at)
      VALUES (?, ?, ?, ?, 'success', 0, ?)
    `).run(
      randomUUID(),
      userId,
      "Добро пожаловать",
      `Аккаунт ${username} готов к работе. Баланс пополнен на 5000 кр.`,
      timestamp,
    );
  }
}

function createOrUpdateUser(db, email) {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error(`Invalid email: ${email}`);
  }

  const existing = db.prepare(`
    SELECT id, username, created_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `).get(normalizedEmail);

  const password = generatePassword();
  const passwordHash = hashPassword(password);
  const timestamp = nowIso();
  const userId = existing?.id ?? randomUUID();
  const username = existing?.username ?? makeUsername(normalizedEmail);
  const createdAt = existing?.created_at ?? timestamp;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, username, avatar, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, NULL, 1, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      password_hash = excluded.password_hash,
      username = excluded.username,
      email_verified = 1,
      updated_at = excluded.updated_at
  `).run(userId, normalizedEmail, passwordHash, username, createdAt, timestamp);

  ensureUserSeed(db, userId, username);

  return {
    email: normalizedEmail,
    password,
    username,
    status: existing ? "updated" : "created",
  };
}

function printUsage() {
  console.log("Usage:");
  console.log("  node scripts/grant-platform-access.mjs email1@example.com email2@example.com");
}

mkdirSync(DATA_DIR, { recursive: true });

if (!existsSync(DB_PATH)) {
  console.error(`Database not found: ${DB_PATH}`);
  process.exit(1);
}

const emails = process.argv.slice(2).filter(Boolean);
if (!emails.length) {
  printUsage();
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);
ensureDatabaseSchema(db);

const results = emails.map((email) => createOrUpdateUser(db, email));

console.log("");
console.log("Platform access granted:");
for (const item of results) {
  console.log(`- ${item.email}`);
  console.log(`  status: ${item.status}`);
  console.log(`  username: ${item.username}`);
  console.log(`  password: ${item.password}`);
}
