import { createServer } from "node:http";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync, existsSync, readFileSync, createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import net from "node:net";
import path from "node:path";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const STORAGE_DIR = path.join(DATA_DIR, "storage");
const DB_PATH = path.join(DATA_DIR, "app.db");
const DIST_DIR = path.join(ROOT_DIR, "dist");

loadEnvFile(path.join(ROOT_DIR, ".env"));

const PORT = Number(process.env.PORT ?? 3001);
const DEMO_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST ?? "",
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: String(process.env.SMTP_SECURE ?? "true").toLowerCase() === "true",
  user: process.env.SMTP_USER ?? "",
  pass: process.env.SMTP_PASS ?? "",
  from: process.env.SMTP_FROM ?? "",
};
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS ?? 15000);
const WAITLIST_NOTIFY_EMAIL =
  process.env.WAITLIST_NOTIFY_EMAIL ??
  process.env.SMTP_FROM ??
  process.env.SMTP_USER ??
  "";
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL ?? "";
const OPENROUTER_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  baseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  imageModel: process.env.OPENROUTER_IMAGE_MODEL ?? "google/gemini-3.1-flash-image-preview",
};
const KLING_CONFIG = {
  accessKey: process.env.KLING_ACCESS_KEY ?? "",
  secretKey: process.env.KLING_SECRET_KEY ?? "",
  apiKey: process.env.KLING_API_KEY ?? "",
  baseUrl: process.env.KLING_API_BASE_URL ?? "https://api-singapore.klingai.com",
  videoModel: process.env.KLING_VIDEO_MODEL ?? "kling-v2.6-pro",
  mode: process.env.KLING_VIDEO_MODE ?? "professional",
};

function encodeBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createKlingJwtToken() {
  if (!KLING_CONFIG.accessKey || !KLING_CONFIG.secretKey) {
    return "";
  }

  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      iss: KLING_CONFIG.accessKey,
      exp: now + 1800,
      nbf: now - 5,
    }),
  );
  const signature = createHmac("sha256", KLING_CONFIG.secretKey)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${header}.${payload}.${signature}`;
}

function getKlingAuthorizationHeader() {
  const token = createKlingJwtToken() || KLING_CONFIG.apiKey;
  return token ? `Bearer ${token}` : "";
}

function hasKlingCredentials() {
  return Boolean(
    (KLING_CONFIG.accessKey && KLING_CONFIG.secretKey) || KLING_CONFIG.apiKey,
  );
}

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(STORAGE_DIR, { recursive: true });
mkdirSync(path.join(STORAGE_DIR, "images"), { recursive: true });
mkdirSync(path.join(STORAGE_DIR, "videos"), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;

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

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    access_token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS otp_codes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    recovery_token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
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

  CREATE TABLE IF NOT EXISTS user_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    emoji TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    generations_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS generated_assets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT,
    type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    result_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    cost INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
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

  CREATE TABLE IF NOT EXISTS brand_briefs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT,
    brand_name TEXT NOT NULL,
    audience TEXT NOT NULL,
    tone TEXT NOT NULL,
    "values" TEXT NOT NULL,
    restrictions TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS video_generations (
    prediction_id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    ready_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    video_url TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS waitlist_entries (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    represents TEXT,
    use_case TEXT,
    role TEXT,
    consent INTEGER NOT NULL DEFAULT 0,
    marketing_consent INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'landing',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_briefs_user_project
    ON brand_briefs (user_id, COALESCE(project_id, 'GLOBAL_BRIEF'));

  CREATE INDEX IF NOT EXISTS idx_balance_transactions_user
    ON balance_transactions (user_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_generated_assets_user
    ON generated_assets (user_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created_at
    ON waitlist_entries (created_at DESC);
`);

db.prepare(`
  UPDATE balance_transactions
  SET description = 'Приветственный бонус'
  WHERE description = 'Welcome bonus'
`).run();

db.prepare(`
  UPDATE user_notifications
  SET message = REPLACE(message, '5000 pts', '5000 кр')
  WHERE message LIKE '%5000 pts%'
`).run();

const TABLE_COLUMNS = {
  user_balances: ["user_id", "points", "updated_at"],
  user_projects: ["id", "user_id", "character_name", "campaign_name", "emoji", "status", "generations_count", "created_at", "updated_at"],
  balance_transactions: ["id", "user_id", "type", "description", "amount", "created_at"],
  generated_assets: ["id", "user_id", "project_id", "type", "prompt", "result_url", "status", "cost", "created_at", "updated_at"],
  user_notifications: ["id", "user_id", "title", "message", "type", "read", "created_at"],
  brand_briefs: ["id", "user_id", "project_id", "brand_name", "audience", "tone", "values", "restrictions", "created_at", "updated_at"],
  support_tickets: ["id", "user_id", "type", "subject", "description", "status", "created_at", "updated_at"],
  waitlist_entries: ["id", "email", "represents", "use_case", "role", "consent", "marketing_consent", "source", "created_at", "updated_at"],
};

const USER_SCOPED_TABLES = new Set([
  "user_balances",
  "user_projects",
  "balance_transactions",
  "generated_assets",
  "user_notifications",
  "brand_briefs",
  "support_tickets",
]);

const MUTATION_DEFAULTS = {
  user_projects: { status: "active", generations_count: 0 },
  support_tickets: { status: "open" },
  generated_assets: { status: "completed", cost: 0 },
  user_notifications: { type: "info", read: 0 },
  brand_briefs: { restrictions: "" },
};

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function futureIso(minutes = 60) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(body);
}

function text(res, status, payload, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, expectedHex] = String(passwordHash ?? "").split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function mapUser(userRow) {
  return {
    id: userRow.id,
    email: userRow.email,
    user_metadata: {
      username: userRow.username,
      avatar_url: userRow.avatar ?? null,
    },
    created_at: userRow.created_at,
    updated_at: userRow.updated_at,
  };
}

function createSession(userId) {
  const sessionId = randomUUID();
  const accessToken = randomUUID();
  const createdAt = nowIso();
  const expiresAt = futureIso(24 * 30 * 60);
  db.prepare(`
    INSERT INTO sessions (id, user_id, access_token, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, userId, accessToken, createdAt, expiresAt);
  return accessToken;
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

function getSessionByToken(token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT s.access_token, s.expires_at, u.*
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.access_token = ?
    LIMIT 1
  `).get(token);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare(`DELETE FROM sessions WHERE access_token = ?`).run(token);
    return null;
  }
  return {
    access_token: row.access_token,
    expires_at: row.expires_at,
    user: mapUser(row),
  };
}

function requireSession(req, res) {
  const token = getTokenFromRequest(req);
  const session = getSessionByToken(token);
  if (!session) {
    json(res, 401, { error: "Unauthorized" });
    return null;
  }
  return session;
}

function ensureUserSeed(userId, username) {
  const timestamp = nowIso();
  db.prepare(`
    INSERT OR IGNORE INTO user_balances (user_id, points, updated_at)
    VALUES (?, 5000, ?)
  `).run(userId, timestamp);

  const existing = db.prepare(`
    SELECT id FROM balance_transactions WHERE user_id = ? AND type = 'credit' AND description = 'Приветственный бонус'
    LIMIT 1
  `).get(userId);
  if (!existing) {
    db.prepare(`
      INSERT INTO balance_transactions (id, user_id, type, description, amount, created_at)
      VALUES (?, ?, 'credit', 'Приветственный бонус', 5000, ?)
    `).run(randomUUID(), userId, timestamp);
  }

  const welcomeNotice = db.prepare(`
    SELECT id FROM user_notifications WHERE user_id = ? AND title = 'Добро пожаловать'
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

function addNotification(userId, title, message, type = "info") {
  db.prepare(`
    INSERT INTO user_notifications (id, user_id, title, message, type, read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(randomUUID(), userId, title, message, type, nowIso());
}

function changeUserBalance(userId, delta, description) {
  const current = db.prepare(`SELECT points FROM user_balances WHERE user_id = ?`).get(userId);
  const currentPoints = Number(current?.points ?? 0);
  const nextPoints = currentPoints + delta;
  if (nextPoints < 0) {
    throw new Error("Недостаточно баллов");
  }

  db.prepare(`
    INSERT INTO user_balances (user_id, points, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET points = excluded.points, updated_at = excluded.updated_at
  `).run(userId, nextPoints, nowIso());

  db.prepare(`
    INSERT INTO balance_transactions (id, user_id, type, description, amount, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    userId,
    delta >= 0 ? "credit" : "debit",
    description,
    delta,
    nowIso(),
  );
}

function ensureUserCanSpend(userId, amount) {
  const current = db.prepare(`SELECT points FROM user_balances WHERE user_id = ?`).get(userId);
  const currentPoints = Number(current?.points ?? 0);
  if (currentPoints < amount) {
    throw new Error("РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ Р±Р°Р»Р»РѕРІ");
  }
}

function maybeIncrementProject(projectId) {
  if (!projectId) return;
  db.prepare(`
    UPDATE user_projects
    SET generations_count = generations_count + 1, updated_at = ?
    WHERE id = ?
  `).run(nowIso(), projectId);
}

function validateTable(table) {
  return Object.prototype.hasOwnProperty.call(TABLE_COLUMNS, table);
}

function validateColumn(table, column) {
  return TABLE_COLUMNS[table].includes(column);
}

function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, "\"\"")}"`;
}

function parseSelectColumns(table, value) {
  if (!value || value === "*") return "*";
  const columns = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!columns.length) return "*";
  for (const column of columns) {
    if (!validateColumn(table, column)) {
      throw new Error(`Invalid column: ${column}`);
    }
  }
  return columns.map((column) => quoteIdentifier(column)).join(", ");
}

function normalizeValue(value) {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (Array.isArray(value) || (value && typeof value === "object")) return JSON.stringify(value);
  return value;
}

function normalizeInputRecord(table, record, currentUserId) {
  const timestamp = nowIso();
  const scoped = USER_SCOPED_TABLES.has(table) ? { ...record, user_id: currentUserId } : { ...record };
  const defaults = MUTATION_DEFAULTS[table] ?? {};
  const next = { ...defaults, ...scoped };

  if (validateColumn(table, "id") && !next.id) next.id = randomUUID();
  if (validateColumn(table, "created_at") && !next.created_at) next.created_at = timestamp;
  if (validateColumn(table, "updated_at")) next.updated_at = next.updated_at ?? timestamp;
  if (table === "user_notifications" && next.read == null) next.read = 0;
  if (table === "user_projects" && next.generations_count == null) next.generations_count = 0;
  return next;
}

function buildWhere(table, filters = [], currentUserId) {
  const clauses = [];
  const params = [];
  const scopedFilters = [...filters];

  if (USER_SCOPED_TABLES.has(table)) {
    scopedFilters.push({ type: "eq", column: "user_id", value: currentUserId });
  }

  for (const filter of scopedFilters) {
    if (!validateColumn(table, filter.column)) {
      throw new Error(`Invalid filter column: ${filter.column}`);
    }
    if (filter.type === "eq") {
      clauses.push(`${quoteIdentifier(filter.column)} = ?`);
      params.push(normalizeValue(filter.value));
    }
    if (filter.type === "in") {
      const values = Array.isArray(filter.value) ? filter.value : [];
      if (!values.length) {
        clauses.push("1 = 0");
      } else {
        clauses.push(`${quoteIdentifier(filter.column)} IN (${values.map(() => "?").join(", ")})`);
        params.push(...values.map((value) => normalizeValue(value)));
      }
    }
  }

  return {
    clause: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

function mapReturnedRows(table, rows) {
  if (table !== "user_notifications") return rows;
  return rows.map((row) => ({ ...row, read: Boolean(row.read) }));
}

function readSvgTemplate(title, subtitle, accent = "#2563eb") {
  const safeTitle = String(title ?? "").slice(0, 100).replace(/[<>&"]/g, "");
  const safeSubtitle = String(subtitle ?? "").slice(0, 180).replace(/[<>&"]/g, "");
  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="${accent}" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="56" fill="url(#bg)" />
  <circle cx="820" cy="180" r="140" fill="rgba(255,255,255,0.08)" />
  <circle cx="210" cy="760" r="200" fill="rgba(255,255,255,0.06)" />
  <rect x="120" y="120" width="784" height="784" rx="36" fill="rgba(15,23,42,0.42)" stroke="rgba(255,255,255,0.16)" />
  <text x="160" y="250" fill="#dbeafe" font-size="42" font-family="Arial, sans-serif">Kovallab Local Generation</text>
  <text x="160" y="360" fill="#ffffff" font-size="64" font-weight="700" font-family="Arial, sans-serif">${safeTitle}</text>
  <foreignObject x="160" y="430" width="680" height="240">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:30px;line-height:1.5;color:#dbeafe;">
      ${safeSubtitle}
    </div>
  </foreignObject>
</svg>`.trim();
}

function contentTypeByExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".mp4") return "video/mp4";
  return "application/octet-stream";
}

function extensionByContentType(contentType, fallback = ".bin") {
  const normalized = String(contentType ?? "").toLowerCase();
  if (normalized.includes("png")) return ".png";
  if (normalized.includes("jpeg") || normalized.includes("jpg")) return ".jpg";
  if (normalized.includes("webp")) return ".webp";
  if (normalized.includes("gif")) return ".gif";
  if (normalized.includes("svg")) return ".svg";
  if (normalized.includes("mp4")) return ".mp4";
  if (normalized.includes("quicktime")) return ".mov";
  if (normalized.includes("webm")) return ".webm";
  return fallback;
}

function safeStoragePath(bucket, relativePath) {
  const bucketDir = path.join(STORAGE_DIR, bucket);
  const resolved = path.resolve(bucketDir, relativePath);
  if (!resolved.startsWith(bucketDir)) return null;
  return resolved;
}

function normalizeAspectRatio(value, fallback = "1:1") {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return fallback;
  if (normalized === "portrait") return "9:16";
  if (normalized === "landscape") return "16:9";
  if (normalized === "square") return "1:1";
  if (/^\d+:\d+$/.test(normalized)) return normalized;
  return fallback;
}

function normalizeImageSize(value) {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (["0.5K", "1K", "2K", "4K"].includes(normalized)) return normalized;
  return "1K";
}

function getRequestOrigin(req) {
  const forwardedProto = Array.isArray(req.headers["x-forwarded-proto"])
    ? req.headers["x-forwarded-proto"][0]
    : req.headers["x-forwarded-proto"];
  const forwardedHost = Array.isArray(req.headers["x-forwarded-host"])
    ? req.headers["x-forwarded-host"][0]
    : req.headers["x-forwarded-host"];
  const protocol = forwardedProto || "http";
  const host = forwardedHost || req.headers.host || `localhost:${PORT}`;
  return `${protocol}://${host}`;
}

function isPrivateHostname(hostname) {
  const normalized = String(hostname ?? "").toLowerCase();
  if (!normalized) return true;
  if (normalized === "localhost" || normalized === "0.0.0.0" || normalized === "::1") return true;
  if (normalized.endsWith(".local")) return true;
  if (/^127\./.test(normalized)) return true;
  if (/^10\./.test(normalized)) return true;
  if (/^192\.168\./.test(normalized)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)) return true;
  return false;
}

function toAbsoluteUrl(baseUrl, pathname) {
  return new URL(pathname, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

function resolvePublicAssetUrl(req, candidate) {
  const raw = String(candidate ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("data:")) return raw;

  const publicBaseUrl = PUBLIC_APP_URL.trim();
  const requestOrigin = getRequestOrigin(req);
  const candidateUrl = raw.startsWith("http") ? new URL(raw) : null;
  if (candidateUrl && !isPrivateHostname(candidateUrl.hostname)) {
    return candidateUrl.toString();
  }

  const pathname = candidateUrl ? `${candidateUrl.pathname}${candidateUrl.search}` : raw;
  if (publicBaseUrl) {
    try {
      const publicHost = new URL(publicBaseUrl).hostname;
      if (!isPrivateHostname(publicHost)) {
        return toAbsoluteUrl(publicBaseUrl, pathname.startsWith("/") ? pathname : `/${pathname}`);
      }
    } catch {
      // Ignore invalid PUBLIC_APP_URL and continue to other fallbacks.
    }
  }

  const requestHost = new URL(requestOrigin).hostname;
  if (!isPrivateHostname(requestHost)) {
    return toAbsoluteUrl(requestOrigin, pathname.startsWith("/") ? pathname : `/${pathname}`);
  }

  return null;
}

function extractTextFromMessageContent(content) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && typeof item.text === "string") return item.text;
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractOpenRouterImageUrl(payload) {
  const message = payload?.choices?.[0]?.message ?? {};
  const image = Array.isArray(message.images) ? message.images[0] : null;
  const openAiStyleBase64 = payload?.data?.[0]?.b64_json;
  return (
    image?.image_url?.url ??
    image?.imageUrl?.url ??
    image?.url ??
    message?.image_url?.url ??
    message?.imageUrl?.url ??
    (openAiStyleBase64 ? `data:image/png;base64,${openAiStyleBase64}` : null) ??
    null
  );
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Unsupported data URL format from image provider");
  }
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

async function writeBufferToStorage(bucket, userId, buffer, contentType) {
  const fallbackExtension = bucket === "videos" ? ".mp4" : ".bin";
  const relativePath = `${userId}/${randomUUID()}${extensionByContentType(contentType, fallbackExtension)}`;
  const filePath = safeStoragePath(bucket, relativePath);
  if (!filePath) {
    throw new Error("Invalid storage destination");
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
  return `/storage/${bucket}/${relativePath}`;
}

async function persistRemoteAsset(bucket, userId, assetUrl, fallbackContentType) {
  const response = await fetch(assetUrl);
  if (!response.ok) {
    return assetUrl;
  }
  const contentType = response.headers.get("content-type") ?? fallbackContentType;
  const buffer = Buffer.from(await response.arrayBuffer());
  return writeBufferToStorage(bucket, userId, buffer, contentType);
}

function extractKlingTaskId(payload) {
  return (
    payload?.task_id ??
    payload?.data?.task_id ??
    payload?.id ??
    payload?.data?.id ??
    payload?.task?.id ??
    null
  );
}

function extractKlingStatus(payload) {
  const rawStatus = String(
    payload?.status ??
    payload?.data?.status ??
    payload?.task?.status ??
    payload?.data?.task?.status ??
    "processing",
  ).toLowerCase();

  if (["completed", "complete", "succeeded", "success", "done"].includes(rawStatus)) return "succeeded";
  if (["failed", "failure", "error"].includes(rawStatus)) return "failed";
  if (["canceled", "cancelled"].includes(rawStatus)) return "canceled";
  return "processing";
}

function extractKlingVideoUrl(payload) {
  const candidates = [
    payload?.video_url,
    payload?.data?.video_url,
    payload?.result?.video_url,
    payload?.data?.result?.video_url,
    payload?.output?.video_url,
    payload?.data?.output?.video_url,
    payload?.output?.url,
    payload?.data?.output?.url,
    Array.isArray(payload?.outputs) ? payload.outputs[0]?.url : null,
    Array.isArray(payload?.data?.outputs) ? payload.data.outputs[0]?.url : null,
  ];
  return candidates.find((value) => typeof value === "string" && value.trim()) ?? null;
}

function extractKlingProgress(payload) {
  const raw =
    payload?.progress ??
    payload?.data?.progress ??
    payload?.task?.progress ??
    payload?.data?.task?.progress;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(99, Math.round(value)));
}

function extractKlingError(payload) {
  return (
    payload?.error?.message ??
    payload?.data?.error?.message ??
    payload?.message ??
    payload?.detail ??
    null
  );
}

function ensureSmtpConfig() {
  const required = ["host", "port", "user", "pass", "from"];
  const missing = required.filter((key) => !SMTP_CONFIG[key]);
  if (missing.length) {
    throw new Error(`SMTP is not configured. Missing: ${missing.join(", ")}`);
  }
}

function encodeMimeWord(value) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function encodeBase64Lines(value) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .match(/.{1,76}/g)
    ?.join("\r\n") ?? "";
}

function smtpEscape(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailMessage({ to, subject, text: plainText, html }) {
  const boundary = `kovallab-${randomUUID()}`;
  return [
    `From: ${smtpEscape(SMTP_CONFIG.from)}`,
    `To: ${smtpEscape(to)}`,
    `Subject: ${encodeMimeWord(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64Lines(plainText),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64Lines(html),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

function buildOtpEmail(code) {
  return {
    subject: "Код подтверждения Kovallab",
    text: `Ваш код подтверждения: ${code}\n\nКод действует 15 минут.\nЕсли вы не запрашивали код, просто проигнорируйте письмо.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:32px;color:#0f172a">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;border:1px solid #dbe5f0">
          <div style="font-size:24px;font-weight:700;margin-bottom:16px">Kovallab</div>
          <div style="font-size:18px;font-weight:600;margin-bottom:12px">Код подтверждения</div>
          <p style="font-size:14px;line-height:1.6;margin:0 0 20px">Используйте этот одноразовый код для завершения регистрации.</p>
          <div style="font-size:36px;letter-spacing:8px;font-weight:700;background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:18px 24px;text-align:center;color:#1d4ed8">
            ${code}
          </div>
          <p style="font-size:13px;line-height:1.6;color:#475569;margin:20px 0 0">Код действует 15 минут. Если вы не запрашивали письмо, просто проигнорируйте его.</p>
        </div>
      </div>
    `.trim(),
  };
}

function buildResetEmail(resetLink) {
  return {
    subject: "Сброс пароля Kovallab",
    text: `Для сброса пароля перейдите по ссылке:\n${resetLink}\n\nСсылка действует 60 минут.\nЕсли вы не запрашивали сброс, просто проигнорируйте письмо.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:32px;color:#0f172a">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;border:1px solid #dbe5f0">
          <div style="font-size:24px;font-weight:700;margin-bottom:16px">Kovallab</div>
          <div style="font-size:18px;font-weight:600;margin-bottom:12px">Сброс пароля</div>
          <p style="font-size:14px;line-height:1.6;margin:0 0 20px">Нажмите на кнопку ниже, чтобы задать новый пароль для аккаунта.</p>
          <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:14px;font-weight:600">Сбросить пароль</a>
          <p style="font-size:13px;line-height:1.6;color:#475569;margin:20px 0 0">Ссылка действует 60 минут. Если вы не запрашивали сброс, просто проигнорируйте письмо.</p>
          <p style="font-size:12px;line-height:1.6;color:#64748b;margin-top:16px;word-break:break-all">${resetLink}</p>
        </div>
      </div>
    `.trim(),
  };
}

function buildWaitlistNotificationEmail(entry) {
  const submittedAt = new Date(entry.updatedAt).toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const represents = entry.represents || "Не указано";
  const useCase = entry.useCase || "Не указано";
  const role = entry.role || "Не указано";
  const source = entry.source || "landing";
  const consent = entry.consent ? "Да" : "Нет";
  const marketingConsent = entry.marketingConsent ? "Да" : "Нет";

  const safeEmail = escapeHtml(entry.email);
  const safeSource = escapeHtml(source);
  const safeRepresents = escapeHtml(represents);
  const safeUseCase = escapeHtml(useCase);
  const safeRole = escapeHtml(role);
  const safeConsent = escapeHtml(consent);
  const safeMarketingConsent = escapeHtml(marketingConsent);
  const safeSubmittedAt = escapeHtml(submittedAt);

  return {
    subject: `Новая заявка в waitlist: ${entry.email}`,
    text: [
      "Новая заявка в лист ожидания Kovallab.",
      "",
      `Email: ${entry.email}`,
      `Источник: ${source}`,
      `Кого представляет: ${represents}`,
      `Сценарий использования: ${useCase}`,
      `Роль: ${role}`,
      `Согласие на обработку данных: ${consent}`,
      `Согласие на рассылку: ${marketingConsent}`,
      `Обновлено: ${submittedAt}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:32px;color:#0f172a">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;border:1px solid #dbe5f0">
          <div style="font-size:24px;font-weight:700;margin-bottom:16px">Kovallab</div>
          <div style="font-size:18px;font-weight:600;margin-bottom:20px">Новая заявка в лист ожидания</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6">
            <tr><td style="padding:8px 0;color:#475569;width:220px">Email</td><td style="padding:8px 0;font-weight:600">${safeEmail}</td></tr>
            <tr><td style="padding:8px 0;color:#475569">Источник</td><td style="padding:8px 0">${safeSource}</td></tr>
            <tr><td style="padding:8px 0;color:#475569">Кого представляет</td><td style="padding:8px 0">${safeRepresents}</td></tr>
            <tr><td style="padding:8px 0;color:#475569">Сценарий использования</td><td style="padding:8px 0">${safeUseCase}</td></tr>
            <tr><td style="padding:8px 0;color:#475569">Роль</td><td style="padding:8px 0">${safeRole}</td></tr>
            <tr><td style="padding:8px 0;color:#475569">Согласие на данные</td><td style="padding:8px 0">${safeConsent}</td></tr>
            <tr><td style="padding:8px 0;color:#475569">Согласие на рассылку</td><td style="padding:8px 0">${safeMarketingConsent}</td></tr>
            <tr><td style="padding:8px 0;color:#475569">Обновлено</td><td style="padding:8px 0">${safeSubmittedAt}</td></tr>
          </table>
        </div>
      </div>
    `.trim(),
  };
}

async function smtpReadResponse(socket, state) {
  while (true) {
    const delimiterIndex = state.buffer.indexOf("\r\n");
    if (delimiterIndex === -1) {
      const chunk = await new Promise((resolve, reject) => {
        const onData = (data) => {
          cleanup();
          resolve(data);
        };
        const onError = (error) => {
          cleanup();
          reject(error);
        };
        const onClose = () => {
          cleanup();
          reject(new Error("SMTP connection closed"));
        };
        const cleanup = () => {
          socket.off("data", onData);
          socket.off("error", onError);
          socket.off("close", onClose);
          socket.off("end", onClose);
        };
        socket.once("data", onData);
        socket.once("error", onError);
        socket.once("close", onClose);
        socket.once("end", onClose);
      });
      state.buffer += chunk.toString("utf8");
      continue;
    }

    const line = state.buffer.slice(0, delimiterIndex);
    state.buffer = state.buffer.slice(delimiterIndex + 2);
    state.lines.push(line);
    if (/^\d{3} /.test(line)) {
      const response = state.lines.join("\n");
      state.lines = [];
      return response;
    }
  }
}

async function smtpCommand(socket, state, command, expectedPrefix) {
  await new Promise((resolve, reject) => {
    socket.write(`${command}\r\n`, (error) => {
      if (error) reject(error);
      else resolve(undefined);
    });
  });
  const response = await smtpReadResponse(socket, state);
  if (expectedPrefix && !response.startsWith(expectedPrefix)) {
    throw new Error(`SMTP error after "${command}": ${response}`);
  }
  return response;
}

function createSmtpSocket() {
  return new Promise((resolve, reject) => {
    const options = { host: SMTP_CONFIG.host, port: SMTP_CONFIG.port };
    const client = SMTP_CONFIG.secure
      ? tls.connect({ ...options, servername: SMTP_CONFIG.host }, () => resolve(client))
      : net.connect(options, () => resolve(client));
    client.setTimeout(SMTP_TIMEOUT_MS);
    client.once("error", reject);
    client.once("timeout", () => reject(new Error(`SMTP timeout after ${SMTP_TIMEOUT_MS}ms`)));
  });
}

function upgradeSmtpSocketToTls(socket) {
  return new Promise((resolve, reject) => {
    socket.removeAllListeners("timeout");
    const client = tls.connect(
      {
        socket,
        servername: SMTP_CONFIG.host,
      },
      () => resolve(client),
    );
    client.setTimeout(SMTP_TIMEOUT_MS);
    client.once("error", reject);
    client.once("timeout", () => reject(new Error(`SMTP timeout after ${SMTP_TIMEOUT_MS}ms`)));
  });
}

async function sendEmail({ to, subject, text: plainText, html }) {
  ensureSmtpConfig();
  const message = buildEmailMessage({ to, subject, text: plainText, html });
  let state = { buffer: "", lines: [] };
  let socket = await createSmtpSocket();

  try {
    const greeting = await smtpReadResponse(socket, state);
    if (!greeting.startsWith("220")) {
      throw new Error(`SMTP greeting failed: ${greeting}`);
    }

    const ehloHost = smtpEscape(SMTP_CONFIG.host) || "localhost";
    const ehloResponse = await smtpCommand(socket, state, `EHLO ${ehloHost}`, "250");
    if (!SMTP_CONFIG.secure && /\bSTARTTLS\b/i.test(ehloResponse)) {
      await smtpCommand(socket, state, "STARTTLS", "220");
      socket = await upgradeSmtpSocketToTls(socket);
      state = { buffer: "", lines: [] };
      await smtpCommand(socket, state, `EHLO ${ehloHost}`, "250");
    }

    await smtpCommand(socket, state, "AUTH LOGIN", "334");
    await smtpCommand(socket, state, Buffer.from(SMTP_CONFIG.user, "utf8").toString("base64"), "334");
    await smtpCommand(socket, state, Buffer.from(SMTP_CONFIG.pass, "utf8").toString("base64"), "235");
    await smtpCommand(socket, state, `MAIL FROM:<${smtpEscape(SMTP_CONFIG.from)}>`, "250");
    await smtpCommand(socket, state, `RCPT TO:<${smtpEscape(to)}>`, "250");
    await smtpCommand(socket, state, "DATA", "354");

    const safeMessage = message.replace(/\r?\n\./g, "\r\n..");
    await new Promise((resolve, reject) => {
      socket.write(`${safeMessage}\r\n.\r\n`, (error) => {
        if (error) reject(error);
        else resolve(undefined);
      });
    });
    const queued = await smtpReadResponse(socket, state);
    if (!queued.startsWith("250")) {
      throw new Error(`SMTP DATA failed: ${queued}`);
    }

    await smtpCommand(socket, state, "QUIT", "221");
  } finally {
    socket.end();
    socket.destroy();
  }
}

async function fetchJson(url, init, label) {
  const response = await fetch(url, init);
  const raw = await response.text();
  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
  }

  if (!response.ok) {
    const message =
      data?.error?.message ??
      data?.message ??
      data?.detail ??
      raw ??
      `${label} failed`;
    throw new Error(`${label} failed (${response.status}): ${message}`);
  }

  return data;
}

async function generateImageWithOpenRouter(req, { prompt, aspectRatio, imageSize, model }) {
  const headers = {
    Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "Kovallab",
    "HTTP-Referer": PUBLIC_APP_URL.trim() || getRequestOrigin(req),
  };

  const payload = await fetchJson(
    `${OPENROUTER_CONFIG.baseUrl}/chat/completions`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
        modalities: ["image", "text"],
        image_config: {
          aspect_ratio: aspectRatio,
          image_size: imageSize,
        },
        stream: false,
      }),
    },
    "OpenRouter image generation",
  );

  const imageUrl = extractOpenRouterImageUrl(payload);
  if (!imageUrl) {
    throw new Error("OpenRouter did not return an image");
  }

  return {
    imageUrl,
    description:
      extractTextFromMessageContent(payload?.choices?.[0]?.message?.content) ||
      `Generated with ${model} via OpenRouter`,
  };
}

async function createKlingVideo(req, { prompt, referenceImageUrl, aspectRatio, seconds, model }) {
  const endpoint = referenceImageUrl ? "/v1/videos/image2video" : "/v1/videos/text2video";
  const imageUrl = referenceImageUrl ? resolvePublicAssetUrl(req, referenceImageUrl) : null;
  const authorization = getKlingAuthorizationHeader();

  if (referenceImageUrl && !imageUrl) {
    throw new Error("Kling requires a public image URL. Set PUBLIC_APP_URL to your public app origin.");
  }
  if (!authorization) {
    throw new Error("Kling credentials are not configured");
  }

  const payload = await fetchJson(
    `${KLING_CONFIG.baseUrl}${endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        duration: seconds,
        aspect_ratio: aspectRatio,
        mode: KLING_CONFIG.mode,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      }),
    },
    "Kling video generation",
  );

  const taskId = extractKlingTaskId(payload);
  if (!taskId) {
    throw new Error("Kling did not return a task id");
  }

  return {
    taskId,
    status: extractKlingStatus(payload),
    videoUrl: extractKlingVideoUrl(payload),
  };
}

async function getKlingVideoStatus(taskId) {
  const authorization = getKlingAuthorizationHeader();
  if (!authorization) {
    throw new Error("Kling credentials are not configured");
  }

  const payload = await fetchJson(
    `${KLING_CONFIG.baseUrl}/v1/videos/${encodeURIComponent(taskId)}`,
    {
      headers: {
        Authorization: authorization,
      },
    },
    "Kling video status",
  );

  return {
    status: extractKlingStatus(payload),
    videoUrl: extractKlingVideoUrl(payload),
    progress: extractKlingProgress(payload),
    error: extractKlingError(payload),
  };
}

async function handleDbOperation(req, res, table) {
  const session = requireSession(req, res);
  if (!session) return;
  if (!validateTable(table)) {
    json(res, 404, { error: "Unknown table" });
    return;
  }

  const {
    operation = "select",
    select = "*",
    returning,
    payload,
    filters = [],
    orders = [],
    limit = null,
    single = false,
    maybeSingle = false,
    onConflict = null,
  } = await readJson(req);

  try {
    const selectClause = parseSelectColumns(table, operation === "select" ? select : (returning ?? "*"));
    const { clause, params } = buildWhere(table, filters, session.user.id);
    let rows = [];

    if (operation === "select") {
      let sql = `SELECT ${selectClause} FROM ${quoteIdentifier(table)}${clause}`;
      if (orders.length) {
        const orderBits = orders.map((item) => {
          if (!validateColumn(table, item.column)) {
            throw new Error(`Invalid order column: ${item.column}`);
          }
          return `${quoteIdentifier(item.column)} ${item.ascending === false ? "DESC" : "ASC"}`;
        });
        sql += ` ORDER BY ${orderBits.join(", ")}`;
      }
      if (limit) sql += ` LIMIT ${Number(limit)}`;
      rows = db.prepare(sql).all(...params);
    } else if (operation === "insert") {
      const records = (Array.isArray(payload) ? payload : [payload]).map((item) => normalizeInputRecord(table, item, session.user.id));
      for (const record of records) {
        const entries = Object.entries(record).filter(([column]) => validateColumn(table, column));
        const columns = entries.map(([column]) => column);
        const values = entries.map(([, value]) => normalizeValue(value));
        const placeholders = columns.map(() => "?").join(", ");
        db.prepare(`
          INSERT INTO ${quoteIdentifier(table)} (${columns.map((column) => quoteIdentifier(column)).join(", ")})
          VALUES (${placeholders})
        `).run(...values);
      }

      if (validateColumn(table, "id")) {
        const ids = records.map((record) => record.id);
        const idSql = ids.map(() => "?").join(", ");
        rows = db.prepare(`SELECT ${selectClause} FROM ${quoteIdentifier(table)} WHERE ${quoteIdentifier("id")} IN (${idSql})`).all(...ids);
      }
    } else if (operation === "update") {
      const record = normalizeInputRecord(table, payload ?? {}, session.user.id);
      const entries = Object.entries(record)
        .filter(([column]) => validateColumn(table, column))
        .filter(([column]) => !["id", "user_id", "created_at"].includes(column));
      const setters = entries.map(([column]) => `${quoteIdentifier(column)} = ?`);
      const values = entries.map(([, value]) => normalizeValue(value));
      if (!setters.length) throw new Error("No update fields");

      db.prepare(`UPDATE ${quoteIdentifier(table)} SET ${setters.join(", ")}${clause}`).run(...values, ...params);
      rows = db.prepare(`SELECT ${selectClause} FROM ${quoteIdentifier(table)}${clause}`).all(...params);
    } else if (operation === "delete") {
      rows = db.prepare(`SELECT ${selectClause} FROM ${quoteIdentifier(table)}${clause}`).all(...params);
      db.prepare(`DELETE FROM ${quoteIdentifier(table)}${clause}`).run(...params);
    } else if (operation === "upsert") {
      const record = normalizeInputRecord(table, payload ?? {}, session.user.id);
      const conflictColumns = String(onConflict ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (!conflictColumns.length) throw new Error("onConflict is required for upsert");
      for (const column of conflictColumns) {
        if (!validateColumn(table, column)) throw new Error(`Invalid onConflict column: ${column}`);
      }

      if (table === "brand_briefs" && conflictColumns.length === 1 && conflictColumns[0] === "user_id" && !record.project_id) {
        const existing = db.prepare(`
          SELECT id FROM brand_briefs
          WHERE user_id = ? AND project_id IS NULL
          LIMIT 1
        `).get(session.user.id);
        if (existing) {
          const next = { ...record, id: existing.id };
          const entries = Object.entries(next)
            .filter(([column]) => validateColumn(table, column))
            .filter(([column]) => !["id", "user_id", "created_at"].includes(column));
          const setters = entries.map(([column]) => `${quoteIdentifier(column)} = ?`);
          const values = entries.map(([, value]) => normalizeValue(value));
          db.prepare(`UPDATE ${quoteIdentifier("brand_briefs")} SET ${setters.join(", ")} WHERE ${quoteIdentifier("id")} = ?`).run(...values, existing.id);
        } else {
          const entries = Object.entries(record).filter(([column]) => validateColumn(table, column));
          const columns = entries.map(([column]) => column);
          const values = entries.map(([, value]) => normalizeValue(value));
          const placeholders = columns.map(() => "?").join(", ");
          db.prepare(`
            INSERT INTO ${quoteIdentifier("brand_briefs")} (${columns.map((column) => quoteIdentifier(column)).join(", ")})
            VALUES (${placeholders})
          `).run(...values);
        }
        rows = db.prepare(`SELECT ${selectClause} FROM ${quoteIdentifier("brand_briefs")} WHERE ${quoteIdentifier("user_id")} = ? AND ${quoteIdentifier("project_id")} IS NULL`).all(session.user.id);
      } else {
        const entries = Object.entries(record).filter(([column]) => validateColumn(table, column));
        const columns = entries.map(([column]) => column);
        const values = entries.map(([, value]) => normalizeValue(value));
        const placeholders = columns.map(() => "?").join(", ");
        const updateColumns = columns.filter((column) => !conflictColumns.includes(column) && column !== "id" && column !== "created_at");
        const updateSql = updateColumns.map((column) => `${quoteIdentifier(column)} = excluded.${quoteIdentifier(column)}`).join(", ");

        db.prepare(`
          INSERT INTO ${quoteIdentifier(table)} (${columns.map((column) => quoteIdentifier(column)).join(", ")})
          VALUES (${placeholders})
          ON CONFLICT (${conflictColumns.map((column) => quoteIdentifier(column)).join(", ")})
          DO UPDATE SET ${updateSql || `${quoteIdentifier(conflictColumns[0])} = excluded.${quoteIdentifier(conflictColumns[0])}`}
        `).run(...values);

        const lookupFilters = conflictColumns.map((column) => ({ type: "eq", column, value: record[column] }));
        const lookup = buildWhere(table, lookupFilters, session.user.id);
        rows = db.prepare(`SELECT ${selectClause} FROM ${quoteIdentifier(table)}${lookup.clause}`).all(...lookup.params);
      }
    } else {
      throw new Error(`Unsupported operation: ${operation}`);
    }

    const mappedRows = mapReturnedRows(table, rows);
    if (single) {
      if (mappedRows.length !== 1) {
        json(res, 200, { data: null, error: { message: "Expected a single row" } });
        return;
      }
      json(res, 200, { data: mappedRows[0], error: null });
      return;
    }
    if (maybeSingle) {
      json(res, 200, { data: mappedRows[0] ?? null, error: null });
      return;
    }
    json(res, 200, { data: mappedRows, error: null });
  } catch (error) {
    json(res, 200, { data: null, error: { message: error instanceof Error ? error.message : "Database error" } });
  }
}

async function handleStorageUpload(req, res, bucket) {
  const session = requireSession(req, res);
  if (!session) return;
  if (!["images", "videos"].includes(bucket)) {
    json(res, 404, { error: "Unknown bucket" });
    return;
  }

  const { path: relativePath, data, contentType = "application/octet-stream" } = await readJson(req);
  if (!relativePath || !data) {
    json(res, 400, { error: "path and data are required" });
    return;
  }

  const filePath = safeStoragePath(bucket, relativePath);
  if (!filePath) {
    json(res, 400, { error: "Invalid storage path" });
    return;
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, Buffer.from(String(data), "base64"));
  json(res, 200, {
    path: relativePath,
    contentType,
    publicUrl: `/storage/${bucket}/${relativePath}`,
  });
}

async function handleStorageRead(res, pathname) {
  const relativePath = decodeURIComponent(pathname.replace(/^\/storage\//, ""));
  const [bucket, ...parts] = relativePath.split("/");
  if (!["images", "videos"].includes(bucket) || !parts.length) {
    text(res, 404, "Not found");
    return;
  }
  const filePath = safeStoragePath(bucket, parts.join("/"));
  if (!filePath || !existsSync(filePath)) {
    text(res, 404, "Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentTypeByExtension(filePath),
    "Cache-Control": "public, max-age=3600",
  });
  createReadStream(filePath).pipe(res);
}

async function handleSendOtp(req, res) {
  const body = await readJson(req);
  const email = String(body.email ?? "").trim().toLowerCase();
  const action = body.action ?? "send";
  const code = String(body.code ?? "").trim();

  if (!email) {
    text(res, 400, "email is required");
    return;
  }

  if (action === "verify") {
    const row = db.prepare(`
      SELECT id, code, expires_at
      FROM otp_codes
      WHERE email = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).get(email);

    if (!row) {
      text(res, 400, "Код не найден. Запросите новый.");
      return;
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      text(res, 400, "Код истёк. Запросите новый.");
      return;
    }
    if (row.code !== code) {
      text(res, 400, "Неверный код подтверждения.");
      return;
    }

    db.prepare(`UPDATE otp_codes SET used = 1 WHERE id = ?`).run(row.id);
    json(res, 200, { success: true });
    return;
  }

  db.prepare(`UPDATE otp_codes SET used = 1 WHERE email = ? AND used = 0`).run(email);
  const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
  db.prepare(`
    INSERT INTO otp_codes (id, email, code, expires_at, used, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(randomUUID(), email, generatedCode, futureIso(15), nowIso());

  json(res, 200, {
    success: true,
    debugCode: generatedCode,
    message: "Для локального режима код возвращается напрямую.",
  });
}

async function handleGenerateImage(req, res) {
  const session = requireSession(req, res);
  if (!session) return;

  const body = await readJson(req);
  const prompt = String(body.prompt ?? "").trim();
  const projectId = body.project_id ?? null;
  const type = String(body.type ?? "photo");
  const imageSize = normalizeImageSize(body.image_size ?? "1K");
  const aspectRatio = normalizeAspectRatio(body.aspect_ratio ?? "1:1", "1:1");
  const model = String(body.model ?? OPENROUTER_CONFIG.imageModel).trim() || OPENROUTER_CONFIG.imageModel;
  const cost = imageSize === "4K" ? 75 : imageSize === "2K" ? 35 : 15;

  if (!prompt) {
    text(res, 400, "prompt is required");
    return;
  }

  try {
    changeUserBalance(session.user.id, -cost, `Генерация ${type}`);
  } catch (error) {
    text(res, 400, error instanceof Error ? error.message : "Недостаточно баллов");
    return;
  }

  const fileName = `${session.user.id}/${randomUUID()}.svg`;
  const svg = readSvgTemplate(
    prompt.slice(0, 32),
    `SQLite-backed local mock image. Resolution: ${imageSize}. Type: ${type}.`,
  );
  const filePath = safeStoragePath("images", fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, svg, "utf8");

  const createdAt = nowIso();
  const assetId = randomUUID();
  const publicUrl = `/storage/images/${fileName}`;

  db.prepare(`
    INSERT INTO generated_assets (id, user_id, project_id, type, prompt, result_url, status, cost, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
  `).run(assetId, session.user.id, projectId, type, prompt, publicUrl, cost, createdAt, createdAt);

  maybeIncrementProject(projectId);
  addNotification(session.user.id, "Фото готово", "Локальная генерация завершена.", "success");

  json(res, 200, {
    url: publicUrl,
    description: "Локальная заглушка генерации сохранена в SQLite и файловом storage.",
    cost,
    assetId,
  });
}

async function handleGenerateVideo(req, res) {
  const session = requireSession(req, res);
  if (!session) return;

  const body = await readJson(req);
  const action = body.action ?? "create";

  if (action === "create") {
    const prompt = String(body.prompt ?? "").trim();
    const projectId = body.projectId ?? null;
    const seconds = Number(body.seconds ?? 5);
    const withSound = Boolean(body.withSound ?? false);
    const cost = 50 + Math.max(0, seconds - 5) * 10 + (withSound ? 30 : 0);

    if (!prompt) {
      text(res, 400, "prompt is required");
      return;
    }

    try {
      changeUserBalance(session.user.id, -cost, "Генерация видео");
    } catch (error) {
      text(res, 400, error instanceof Error ? error.message : "Недостаточно баллов");
      return;
    }

    const assetId = randomUUID();
    const predictionId = randomUUID();
    const createdAt = nowIso();

    db.prepare(`
      INSERT INTO generated_assets (id, user_id, project_id, type, prompt, result_url, status, cost, created_at, updated_at)
      VALUES (?, ?, ?, 'video', ?, '', 'pending', ?, ?, ?)
    `).run(assetId, session.user.id, projectId, prompt, cost, createdAt, createdAt);

    db.prepare(`
      INSERT INTO video_generations (prediction_id, asset_id, user_id, ready_at, status, video_url, created_at)
      VALUES (?, ?, ?, ?, 'processing', ?, ?)
    `).run(predictionId, assetId, session.user.id, new Date(Date.now() + 5000).toISOString(), DEMO_VIDEO_URL, createdAt);

    maybeIncrementProject(projectId);
    addNotification(session.user.id, "Видео в очереди", "Локальная генерация видео запущена.", "info");

    json(res, 200, {
      predictionId,
      assetId,
      status: "processing",
      cost,
    });
    return;
  }

  const predictionId = String(body.predictionId ?? "");
  const assetId = String(body.assetId ?? "");
  const row = db.prepare(`
    SELECT * FROM video_generations
    WHERE prediction_id = ? AND user_id = ?
    LIMIT 1
  `).get(predictionId, session.user.id);

  if (!row) {
    text(res, 404, "Video generation not found");
    return;
  }

  const readyAt = new Date(row.ready_at).getTime();
  if (Date.now() < readyAt) {
    const total = Math.max(readyAt - new Date(row.created_at).getTime(), 1);
    const elapsed = Math.max(Date.now() - new Date(row.created_at).getTime(), 0);
    const progress = Math.min(95, Math.round((elapsed / total) * 100));
    json(res, 200, { status: "processing", progress });
    return;
  }

  db.prepare(`UPDATE video_generations SET status = 'completed' WHERE prediction_id = ?`).run(predictionId);
  db.prepare(`
    UPDATE generated_assets
    SET result_url = ?, status = 'completed', updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(row.video_url, nowIso(), assetId || row.asset_id, session.user.id);

  addNotification(session.user.id, "Видео готово", "Локальная генерация видео завершена.", "success");
  json(res, 200, { status: "succeeded", videoUrl: row.video_url, progress: 100 });
}

async function handleGenerateImageProvider(req, res) {
  const session = requireSession(req, res);
  if (!session) return;

  const body = await readJson(req);
  const prompt = String(body.prompt ?? "").trim();
  const projectId = body.project_id ?? null;
  const type = String(body.type ?? "photo");
  const imageSize = normalizeImageSize(body.image_size ?? "1K");
  const aspectRatio = normalizeAspectRatio(body.aspect_ratio ?? "1:1", "1:1");
  const model = String(body.model ?? OPENROUTER_CONFIG.imageModel).trim() || OPENROUTER_CONFIG.imageModel;
  const cost = imageSize === "4K" ? 75 : imageSize === "2K" ? 35 : 15;

  if (!prompt) {
    text(res, 400, "prompt is required");
    return;
  }

  let charged = false;
  try {
    changeUserBalance(session.user.id, -cost, `Generation ${type}`);
    charged = true;

    const createdAt = nowIso();
    const assetId = randomUUID();
    let publicUrl = "";
    let description = "";

    if (OPENROUTER_CONFIG.apiKey) {
      const generated = await generateImageWithOpenRouter(req, {
        prompt,
        aspectRatio,
        imageSize,
        model,
      });

      if (String(generated.imageUrl).startsWith("data:")) {
        const parsedImage = parseDataUrl(generated.imageUrl);
        publicUrl = await writeBufferToStorage("images", session.user.id, parsedImage.buffer, parsedImage.contentType);
      } else {
        publicUrl = await persistRemoteAsset("images", session.user.id, generated.imageUrl, "image/png");
      }
      description = generated.description;
    } else {
      const fileName = `${session.user.id}/${randomUUID()}.svg`;
      const svg = readSvgTemplate(
        prompt.slice(0, 32),
        `SQLite-backed local mock image. Resolution: ${imageSize}. Type: ${type}.`,
      );
      const filePath = safeStoragePath("images", fileName);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, svg, "utf8");
      publicUrl = `/storage/images/${fileName}`;
      description = "Локальная заглушка сохранена. Для real image generation добавьте OPENROUTER_API_KEY.";
    }

    db.prepare(`
      INSERT INTO generated_assets (id, user_id, project_id, type, prompt, result_url, status, cost, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
    `).run(assetId, session.user.id, projectId, type, prompt, publicUrl, cost, createdAt, createdAt);

    maybeIncrementProject(projectId);
    addNotification(
      session.user.id,
      "Р¤РѕС‚Рѕ РіРѕС‚РѕРІРѕ",
      OPENROUTER_CONFIG.apiKey
        ? "Генерация через OpenRouter завершена."
        : "Локальная заглушка сохранена. Для real generation добавьте OPENROUTER_API_KEY.",
      "success",
    );

    json(res, 200, {
      url: publicUrl,
      description,
      cost,
      assetId,
    });
  } catch (error) {
    if (charged) {
      try {
        changeUserBalance(session.user.id, cost, "Generation refund");
      } catch {
        // ignore refund errors
      }
    }
    text(res, 400, error instanceof Error ? error.message : "Image generation failed");
  }
}

async function handleGenerateVideoProvider(req, res) {
  const session = requireSession(req, res);
  if (!session) return;

  const body = await readJson(req);
  const action = body.action ?? "create";

  if (action === "create") {
    const prompt = String(body.prompt ?? "").trim();
    const projectId = body.projectId ?? null;
    const seconds = Number(body.seconds ?? 5);
    const withSound = Boolean(body.withSound ?? false);
    const referenceImageUrl = String(body.referenceImageUrl ?? "").trim();
    const aspectRatio = normalizeAspectRatio(body.aspectRatio ?? body.aspect_ratio ?? "portrait", "9:16");
    const model = String(body.model ?? KLING_CONFIG.videoModel).trim() || KLING_CONFIG.videoModel;
    const cost = 50 + Math.max(0, seconds - 5) * 10 + (withSound ? 30 : 0);

    if (!prompt) {
      text(res, 400, "prompt is required");
      return;
    }

    let charged = false;
    try {
      changeUserBalance(session.user.id, -cost, "Video generation");
      charged = true;

      const assetId = randomUUID();
      const createdAt = nowIso();
      let predictionId = `demo-${randomUUID()}`;
      let generationStatus = "processing";
      let readyAt = new Date(Date.now() + 5000).toISOString();
      let storedVideoUrl = DEMO_VIDEO_URL;

      if (hasKlingCredentials()) {
        const klingJob = await createKlingVideo(req, {
          prompt,
          referenceImageUrl,
          aspectRatio,
          seconds,
          model,
        });
        predictionId = klingJob.taskId;
        generationStatus = klingJob.status;
        readyAt = createdAt;
        storedVideoUrl = klingJob.videoUrl
          ? await persistRemoteAsset("videos", session.user.id, klingJob.videoUrl, "video/mp4")
          : "";
      }

      db.prepare(`
        INSERT INTO generated_assets (id, user_id, project_id, type, prompt, result_url, status, cost, created_at, updated_at)
        VALUES (?, ?, ?, 'video', ?, ?, ?, ?, ?, ?)
      `).run(
        assetId,
        session.user.id,
        projectId,
        prompt,
        generationStatus === "succeeded" ? storedVideoUrl : "",
        generationStatus === "succeeded" ? "completed" : "pending",
        cost,
        createdAt,
        createdAt,
      );

      db.prepare(`
        INSERT INTO video_generations (prediction_id, asset_id, user_id, ready_at, status, video_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(predictionId, assetId, session.user.id, readyAt, generationStatus, storedVideoUrl || null, createdAt);

      maybeIncrementProject(projectId);
      addNotification(
        session.user.id,
        generationStatus === "succeeded" ? "Р’РёРґРµРѕ РіРѕС‚РѕРІРѕ" : "Р’РёРґРµРѕ РІ РѕС‡РµСЂРµРґРё",
        hasKlingCredentials()
          ? generationStatus === "succeeded"
            ? "Kling вернул готовое видео."
            : "Генерация видео через Kling запущена."
          : "Локальная демо-генерация видео запущена. Для real generation добавьте KLING_ACCESS_KEY и KLING_SECRET_KEY.",
        generationStatus === "succeeded" ? "success" : "info",
      );

      json(res, 200, {
        predictionId,
        assetId,
        status: generationStatus === "succeeded" ? "processing" : generationStatus,
        cost,
      });
    } catch (error) {
      if (charged) {
        try {
          changeUserBalance(session.user.id, cost, "Video refund");
        } catch {
          // ignore refund errors
        }
      }
      text(res, 400, error instanceof Error ? error.message : "Video generation failed");
    }
    return;
  }

  const predictionId = String(body.predictionId ?? "");
  const assetId = String(body.assetId ?? "");
  const row = db.prepare(`
    SELECT * FROM video_generations
    WHERE prediction_id = ? AND user_id = ?
    LIMIT 1
  `).get(predictionId, session.user.id);

  if (!row) {
    text(res, 404, "Video generation not found");
    return;
  }

  if (row.prediction_id.startsWith("demo-")) {
    const readyAt = new Date(row.ready_at).getTime();
    if (Date.now() < readyAt) {
      const total = Math.max(readyAt - new Date(row.created_at).getTime(), 1);
      const elapsed = Math.max(Date.now() - new Date(row.created_at).getTime(), 0);
      const progress = Math.min(95, Math.round((elapsed / total) * 100));
      json(res, 200, { status: "processing", progress });
      return;
    }

    db.prepare(`UPDATE video_generations SET status = 'completed' WHERE prediction_id = ?`).run(predictionId);
    db.prepare(`
      UPDATE generated_assets
      SET result_url = ?, status = 'completed', updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(row.video_url, nowIso(), assetId || row.asset_id, session.user.id);

    addNotification(session.user.id, "Р’РёРґРµРѕ РіРѕС‚РѕРІРѕ", "Локальная демо-генерация видео завершена.", "success");
    json(res, 200, { status: "succeeded", videoUrl: row.video_url, progress: 100 });
    return;
  }

  if (!hasKlingCredentials()) {
    text(res, 500, "Kling credentials are not configured");
    return;
  }

  if ((row.status === "completed" || row.status === "succeeded") && row.video_url) {
    json(res, 200, { status: "succeeded", videoUrl: row.video_url, progress: 100 });
    return;
  }
  if (row.status === "failed" || row.status === "canceled") {
    json(res, 200, { status: row.status, error: "Video generation failed" });
    return;
  }

  const klingStatus = await getKlingVideoStatus(predictionId);
  if (klingStatus.status === "processing") {
    json(res, 200, { status: "processing", progress: klingStatus.progress ?? 10 });
    return;
  }

  if (klingStatus.status === "failed" || klingStatus.status === "canceled") {
    db.prepare(`
      UPDATE video_generations
      SET status = ?
      WHERE prediction_id = ?
    `).run(klingStatus.status, predictionId);
    db.prepare(`
      UPDATE generated_assets
      SET status = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(klingStatus.status, nowIso(), assetId || row.asset_id, session.user.id);
    json(res, 200, {
      status: klingStatus.status,
      error: klingStatus.error ?? "Kling video generation failed",
    });
    return;
  }

  if (!klingStatus.videoUrl) {
    text(res, 502, "Kling marked the task as completed but did not return a video URL");
    return;
  }

  const localVideoUrl = await persistRemoteAsset("videos", session.user.id, klingStatus.videoUrl, "video/mp4");
  db.prepare(`
    UPDATE video_generations
    SET status = 'completed', video_url = ?
    WHERE prediction_id = ?
  `).run(localVideoUrl, predictionId);
  db.prepare(`
    UPDATE generated_assets
    SET result_url = ?, status = 'completed', updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(localVideoUrl, nowIso(), assetId || row.asset_id, session.user.id);

  addNotification(session.user.id, "Р’РёРґРµРѕ РіРѕС‚РѕРІРѕ", "Генерация видео через Kling завершена.", "success");
  json(res, 200, { status: "succeeded", videoUrl: localVideoUrl, progress: 100 });
}

async function handleWaitlistSignup(req, res) {
  const body = await readJson(req);
  const email = String(body.email ?? "").trim().toLowerCase();
  const represents = String(body.represents ?? "").trim();
  const useCase = String(body.useCase ?? "").trim();
  const role = String(body.role ?? "").trim();
  const source = String(body.source ?? "landing").trim() || "landing";
  const consent = Boolean(body.consent);
  const marketingConsent = Boolean(body.marketingConsent);

  if (!email) {
    text(res, 400, "email is required");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    text(res, 400, "email is invalid");
    return;
  }
  if (!consent) {
    text(res, 400, "consent is required");
    return;
  }
  if (!marketingConsent) {
    text(res, 400, "marketing consent is required");
    return;
  }

  const existing = db.prepare(`
    SELECT id, created_at
    FROM waitlist_entries
    WHERE email = ?
    LIMIT 1
  `).get(email);
  const id = existing?.id ?? randomUUID();
  const createdAt = existing?.created_at ?? nowIso();
  const updatedAt = nowIso();

  db.prepare(`
    INSERT INTO waitlist_entries (
      id, email, represents, use_case, role, consent, marketing_consent, source, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      represents = excluded.represents,
      use_case = excluded.use_case,
      role = excluded.role,
      consent = excluded.consent,
      marketing_consent = excluded.marketing_consent,
      source = excluded.source,
      updated_at = excluded.updated_at
  `).run(
    id,
    email,
    represents || null,
    useCase || null,
    role || null,
    consent ? 1 : 0,
    marketingConsent ? 1 : 0,
    source,
    createdAt,
    updatedAt,
  );

  json(res, 200, {
    success: true,
    existed: Boolean(existing),
    emailQueued: Boolean(WAITLIST_NOTIFY_EMAIL),
  });

  if (WAITLIST_NOTIFY_EMAIL) {
    void sendEmail({
        to: WAITLIST_NOTIFY_EMAIL,
        ...buildWaitlistNotificationEmail({
          email,
          represents,
          useCase,
          role,
          consent,
          marketingConsent,
          source,
          updatedAt,
        }),
      }).catch((error) => {
        console.error("[waitlist-email]", error);
      });
  }
}

async function handleDeleteAccount(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  const userId = session.user.id;

  db.prepare(`DELETE FROM video_generations WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM otp_codes WHERE email = ?`).run(session.user.email.toLowerCase());
  db.prepare(`DELETE FROM password_resets WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM balance_transactions WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM user_balances WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM user_projects WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM generated_assets WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM user_notifications WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM brand_briefs WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM support_tickets WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);

  const userDir = safeStoragePath("images", userId);
  const videoDir = safeStoragePath("videos", userId);
  if (userDir && existsSync(userDir)) await fs.rm(userDir, { recursive: true, force: true });
  if (videoDir && existsSync(videoDir)) await fs.rm(videoDir, { recursive: true, force: true });

  json(res, 200, { success: true });
}

async function handleSendOtpEmail(req, res) {
  const body = await readJson(req);
  const email = String(body.email ?? "").trim().toLowerCase();
  const action = body.action ?? "send";
  const code = String(body.code ?? "").trim();

  if (!email) {
    text(res, 400, "email is required");
    return;
  }

  if (action === "verify") {
    const row = db.prepare(`
      SELECT id, code, expires_at
      FROM otp_codes
      WHERE email = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).get(email);

    if (!row) {
      text(res, 400, "Код не найден. Запросите новый.");
      return;
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      text(res, 400, "Код истёк. Запросите новый.");
      return;
    }
    if (row.code !== code) {
      text(res, 400, "Неверный код подтверждения.");
      return;
    }

    db.prepare(`UPDATE otp_codes SET used = 1 WHERE id = ?`).run(row.id);
    json(res, 200, { success: true });
    return;
  }

  db.prepare(`UPDATE otp_codes SET used = 1 WHERE email = ? AND used = 0`).run(email);
  const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
  db.prepare(`
    INSERT INTO otp_codes (id, email, code, expires_at, used, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(randomUUID(), email, generatedCode, futureIso(15), nowIso());

  try {
    await sendEmail({
      to: email,
      ...buildOtpEmail(generatedCode),
    });
  } catch (error) {
    text(res, 500, error instanceof Error ? error.message : "Не удалось отправить email");
    return;
  }

  json(res, 200, { success: true });
}

async function handleAuth(req, res, pathname) {
  const body = req.method === "GET" ? {} : await readJson(req);

  if (pathname === "/api/auth/session") {
    const session = getSessionByToken(getTokenFromRequest(req));
    json(res, 200, { session });
    return;
  }

  if (pathname === "/api/auth/sign-up") {
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const username = String(body.options?.data?.username ?? email.split("@")[0] ?? "user").trim();

    if (!email || !password) {
      json(res, 200, { data: { user: null, session: null }, error: { message: "Email and password are required" } });
      return;
    }

    const existing = db.prepare(`SELECT id FROM users WHERE email = ? LIMIT 1`).get(email);
    if (existing) {
      json(res, 200, { data: { user: null, session: null }, error: { message: "User already registered" } });
      return;
    }

    const userId = randomUUID();
    const timestamp = nowIso();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, username, avatar, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, NULL, 1, ?, ?)
    `).run(userId, email, hashPassword(password), username || "user", timestamp, timestamp);

    ensureUserSeed(userId, username || "user");
    const accessToken = createSession(userId);
    const userRow = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);

    json(res, 200, {
      data: {
        user: mapUser(userRow),
        session: { access_token: accessToken, user: mapUser(userRow) },
      },
      error: null,
    });
    return;
  }

  if (pathname === "/api/auth/sign-in") {
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const userRow = db.prepare(`SELECT * FROM users WHERE email = ? LIMIT 1`).get(email);
    if (!userRow || !verifyPassword(password, userRow.password_hash)) {
      json(res, 200, { data: { user: null, session: null }, error: { message: "Invalid login credentials" } });
      return;
    }

    ensureUserSeed(userRow.id, userRow.username);
    const accessToken = createSession(userRow.id);
    json(res, 200, {
      data: {
        user: mapUser(userRow),
        session: { access_token: accessToken, user: mapUser(userRow) },
      },
      error: null,
    });
    return;
  }

  if (pathname === "/api/auth/sign-out") {
    const token = getTokenFromRequest(req);
    if (token) db.prepare(`DELETE FROM sessions WHERE access_token = ?`).run(token);
    json(res, 200, { error: null });
    return;
  }

  if (pathname === "/api/auth/update-user") {
    const session = requireSession(req, res);
    if (!session) return;

    const nextUsername = String(body.data?.username ?? session.user.user_metadata.username ?? "").trim();
    const nextAvatar = body.data?.avatar_url ?? session.user.user_metadata.avatar_url ?? null;
    const updates = [];
    const values = [];

    if (nextUsername) {
      updates.push("username = ?");
      values.push(nextUsername);
    }
    if (body.password) {
      updates.push("password_hash = ?");
      values.push(hashPassword(String(body.password)));
    }
    updates.push("avatar = ?");
    values.push(nextAvatar);
    updates.push("updated_at = ?");
    values.push(nowIso());
    values.push(session.user.id);

    db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    const userRow = db.prepare(`SELECT * FROM users WHERE id = ?`).get(session.user.id);
    json(res, 200, { data: { user: mapUser(userRow), session: { ...session, user: mapUser(userRow) } }, error: null });
    return;
  }

  if (pathname === "/api/auth/reset-password") {
    const email = String(body.email ?? "").trim().toLowerCase();
    const redirectTo = String(body.redirectTo ?? `${body.origin ?? ""}/auth/reset-password`).trim();
    const userRow = db.prepare(`SELECT * FROM users WHERE email = ? LIMIT 1`).get(email);

    if (userRow) {
      const recoveryToken = randomUUID();
      db.prepare(`
        INSERT INTO password_resets (id, user_id, email, recovery_token, expires_at, used, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `).run(randomUUID(), userRow.id, email, recoveryToken, futureIso(60), nowIso());

      const separator = redirectTo.includes("?") ? "&" : "?";
      const resetLink = `${redirectTo}${separator}recovery_token=${encodeURIComponent(recoveryToken)}`;

      try {
        await sendEmail({
          to: email,
          ...buildResetEmail(resetLink),
        });
      } catch (error) {
        json(res, 200, { data: { sent: false }, error: { message: error instanceof Error ? error.message : "Email send failed" } });
        return;
      }
    }

    json(res, 200, { data: { sent: true }, error: null });
    return;
  }

  if (pathname === "/api/auth/reset-password") {
    const email = String(body.email ?? "").trim().toLowerCase();
    const userRow = db.prepare(`SELECT * FROM users WHERE email = ? LIMIT 1`).get(email);
    if (!userRow) {
      json(res, 200, { data: { recoveryToken: null }, error: null });
      return;
    }

    const recoveryToken = randomUUID();
    db.prepare(`
      INSERT INTO password_resets (id, user_id, email, recovery_token, expires_at, used, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(randomUUID(), userRow.id, email, recoveryToken, futureIso(60), nowIso());

    json(res, 200, { data: { recoveryToken }, error: null });
    return;
  }

  if (pathname === "/api/auth/update-password") {
    const session = getSessionByToken(getTokenFromRequest(req));
    const password = String(body.password ?? "");
    if (!password) {
      json(res, 200, { data: { user: null }, error: { message: "Password is required" } });
      return;
    }

    let userId = session?.user.id ?? null;
    if (!userId && body.recoveryToken) {
      const recovery = db.prepare(`
        SELECT * FROM password_resets
        WHERE recovery_token = ? AND used = 0
        ORDER BY created_at DESC
        LIMIT 1
      `).get(String(body.recoveryToken));

      if (!recovery || new Date(recovery.expires_at).getTime() < Date.now()) {
        json(res, 200, { data: { user: null }, error: { message: "Recovery token is invalid or expired" } });
        return;
      }

      userId = recovery.user_id;
      db.prepare(`UPDATE password_resets SET used = 1 WHERE id = ?`).run(recovery.id);
    }

    if (!userId) {
      json(res, 200, { data: { user: null }, error: { message: "Unauthorized" } });
      return;
    }

    db.prepare(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`).run(hashPassword(password), nowIso(), userId);
    const userRow = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
    const nextSession = session ?? { access_token: createSession(userId), user: mapUser(userRow) };
    json(res, 200, { data: { user: mapUser(userRow), session: nextSession }, error: null });
    return;
  }

  json(res, 404, { error: "Unknown auth route" });
}

async function serveDist(res, pathname) {
  if (!existsSync(DIST_DIR)) {
    text(res, 404, "Frontend build not found");
    return;
  }

  let filePath = path.join(DIST_DIR, pathname === "/" ? "index.html" : pathname);
  if (!filePath.startsWith(DIST_DIR)) {
    text(res, 403, "Forbidden");
    return;
  }
  if (!existsSync(filePath)) {
    filePath = path.join(DIST_DIR, "index.html");
  }

  const content = readFileSync(filePath);
  text(res, 200, content, contentTypeByExtension(filePath));
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    text(res, 400, "Bad request");
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    if (req.method === "GET" && pathname === "/api/health") {
      json(res, 200, { ok: true });
      return;
    }
    if (req.method === "POST" && pathname.startsWith("/api/db/")) {
      await handleDbOperation(req, res, pathname.slice("/api/db/".length));
      return;
    }
    if ((req.method === "GET" || req.method === "POST") && pathname.startsWith("/api/auth/")) {
      await handleAuth(req, res, pathname);
      return;
    }
    if (req.method === "POST" && pathname === "/api/functions/send-otp") {
      await handleSendOtpEmail(req, res);
      return;
    }
    if (req.method === "POST" && pathname === "/api/functions/waitlist") {
      await handleWaitlistSignup(req, res);
      return;
    }
    if (req.method === "POST" && pathname === "/api/functions/generate-image") {
      await handleGenerateImageProvider(req, res);
      return;
    }
    if (req.method === "POST" && pathname === "/api/functions/generate-video") {
      await handleGenerateVideoProvider(req, res);
      return;
    }
    if (req.method === "POST" && pathname === "/api/functions/delete-account") {
      await handleDeleteAccount(req, res);
      return;
    }
    if (req.method === "POST" && pathname.startsWith("/api/storage/") && pathname.endsWith("/upload")) {
      const bucket = pathname.split("/")[3];
      await handleStorageUpload(req, res, bucket);
      return;
    }
    if (req.method === "GET" && pathname.startsWith("/storage/")) {
      await handleStorageRead(res, pathname);
      return;
    }
    if (req.method === "GET") {
      await serveDist(res, pathname);
      return;
    }

    text(res, 404, "Not found");
  } catch (error) {
    console.error("[server]", error);
    json(res, 500, { error: error instanceof Error ? error.message : "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Kovallab local API listening on http://localhost:${PORT}`);
});
