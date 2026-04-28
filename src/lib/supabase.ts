type JsonRecord = Record<string, unknown>;

export type User = {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
    picture?: string | null;
  };
  created_at?: string;
  updated_at?: string;
};

export type Session = {
  access_token: string;
  user: User;
};

type AuthEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "PASSWORD_RECOVERY";

type FunctionInvokeOptions = {
  body?: unknown;
  headers?: Record<string, string>;
};

type QueryFilter =
  | { type: "eq"; column: string; value: unknown }
  | { type: "in"; column: string; value: unknown[] };

type QueryOrder = {
  column: string;
  ascending?: boolean;
};

const SESSION_KEY = "kovallab.local.session";
const RECOVERY_KEY = "kovallab.local.recovery";

const authListeners = new Set<(event: AuthEvent, session: Session | null) => void>();

function readStoredSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function writeStoredSession(session: Session | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function getRecoveryToken() {
  return localStorage.getItem(RECOVERY_KEY);
}

function setRecoveryToken(token: string | null) {
  if (token) localStorage.setItem(RECOVERY_KEY, token);
  else localStorage.removeItem(RECOVERY_KEY);
}

function resolveUrl(pathname: string) {
  return pathname.startsWith("http") ? pathname : `${window.location.origin}${pathname}`;
}

function emitAuth(event: AuthEvent, session: Session | null) {
  for (const listener of authListeners) listener(event, session);
}

async function apiRequest<T>(pathname: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const session = readStoredSession();
  if (session?.access_token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(pathname, { ...init, headers });
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

type FunctionErrorContext = {
  text(): Promise<string>;
};

export class FunctionsHttpError extends Error {
  context: FunctionErrorContext;

  constructor(message: string, context: FunctionErrorContext) {
    super(message);
    this.name = "FunctionsHttpError";
    this.context = context;
  }
}

class QueryBuilder<TData = unknown> implements PromiseLike<{ data: TData | null; error: { message: string } | null }> {
  private readonly table: string;
  private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private selectColumns = "*";
  private returnColumns: string | null = null;
  private payload: unknown = null;
  private filters: QueryFilter[] = [];
  private orders: QueryOrder[] = [];
  private rowLimit: number | null = null;
  private expectsSingle = false;
  private expectsMaybeSingle = false;
  private conflictTarget: string | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = "*") {
    if (this.operation === "select") this.selectColumns = columns;
    else this.returnColumns = columns;
    return this;
  }

  insert(payload: unknown) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: unknown) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  upsert(payload: unknown, options?: { onConflict?: string }) {
    this.operation = "upsert";
    this.payload = payload;
    this.conflictTarget = options?.onConflict ?? null;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: "eq", column, value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ type: "in", column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending });
    return this;
  }

  limit(value: number) {
    this.rowLimit = value;
    return this;
  }

  single() {
    this.expectsSingle = true;
    return this;
  }

  maybeSingle() {
    this.expectsMaybeSingle = true;
    return this;
  }

  private async execute() {
    try {
      const response = await apiRequest<{ data: TData | null; error: { message: string } | null }>(`/api/db/${this.table}`, {
        method: "POST",
        body: JSON.stringify({
          operation: this.operation,
          select: this.selectColumns,
          returning: this.returnColumns,
          payload: this.payload,
          filters: this.filters,
          orders: this.orders,
          limit: this.rowLimit,
          single: this.expectsSingle,
          maybeSingle: this.expectsMaybeSingle,
          onConflict: this.conflictTarget,
        }),
      });
      return response;
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : "Request failed" },
      };
    }
  }

  then<TResult1 = { data: TData | null; error: { message: string } | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: TData | null; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

async function blobToBase64(file: Blob | File | Uint8Array | ArrayBuffer) {
  if (file instanceof Uint8Array) {
    let binary = "";
    file.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  const buffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

const auth = {
  async getSession() {
    const current = readStoredSession();
    if (!current) return { data: { session: null } };

    try {
      const response = await apiRequest<{ session: Session | null }>("/api/auth/session");
      if (!response.session) {
        writeStoredSession(null);
        return { data: { session: null } };
      }
      writeStoredSession(response.session);
      return { data: { session: response.session } };
    } catch {
      writeStoredSession(null);
      return { data: { session: null } };
    }
  },

  onAuthStateChange(callback: (event: AuthEvent, session: Session | null) => void) {
    authListeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe() {
            authListeners.delete(callback);
          },
        },
      },
    };
  },

  async signUp(payload: { email: string; password: string; options?: JsonRecord }) {
    const response = await apiRequest<{ data: { user: User | null; session: Session | null }; error: { message: string } | null }>(
      "/api/auth/sign-up",
      { method: "POST", body: JSON.stringify(payload) },
    );
    if (response.error || !response.data.session || !response.data.user) {
      return { data: { user: null, session: null }, error: response.error ?? { message: "Sign-up failed" } };
    }
    writeStoredSession(response.data.session);
    emitAuth("SIGNED_IN", response.data.session);
    return { data: response.data, error: null };
  },

  async signInWithPassword(payload: { email: string; password: string }) {
    const response = await apiRequest<{ data: { user: User | null; session: Session | null }; error: { message: string } | null }>(
      "/api/auth/sign-in",
      { method: "POST", body: JSON.stringify(payload) },
    );
    if (response.error || !response.data.session || !response.data.user) {
      return { data: { user: null, session: null }, error: response.error ?? { message: "Sign-in failed" } };
    }
    writeStoredSession(response.data.session);
    emitAuth("SIGNED_IN", response.data.session);
    return { data: response.data, error: null };
  },

  async signOut() {
    try {
      await apiRequest("/api/auth/sign-out", { method: "POST", body: JSON.stringify({}) });
    } finally {
      writeStoredSession(null);
      emitAuth("SIGNED_OUT", null);
    }
    return { error: null };
  },

  async updateUser(payload: { password?: string; data?: JsonRecord }) {
    const endpoint = payload.password && !readStoredSession() ? "/api/auth/update-password" : "/api/auth/update-user";
    const requestBody =
      endpoint === "/api/auth/update-password"
        ? { password: payload.password, recoveryToken: getRecoveryToken() }
        : payload;
    const response = await apiRequest<{ data: { user: User | null; session?: Session | null }; error: { message: string } | null }>(
      endpoint,
      { method: "POST", body: JSON.stringify(requestBody) },
    );
    if (response.error || !response.data.user) {
      return { data: { user: null }, error: response.error ?? { message: "Update failed" } };
    }

    const currentSession = readStoredSession();
    const nextSession =
      response.data.session ??
      (currentSession ? { ...currentSession, user: response.data.user } : null);
    if (nextSession) {
      writeStoredSession(nextSession);
      emitAuth("TOKEN_REFRESHED", nextSession);
    }
    if (endpoint === "/api/auth/update-password") {
      setRecoveryToken(null);
    }
    return { data: { user: response.data.user }, error: null };
  },

  async resetPasswordForEmail(email: string, options?: JsonRecord) {
    const response = await apiRequest<{ data: { sent: boolean }; error: { message: string } | null }>(
      "/api/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          redirectTo: typeof options?.redirectTo === "string" ? options.redirectTo : `${window.location.origin}/auth/reset-password`,
          origin: window.location.origin,
        }),
      },
    );
    if (response.error) return { error: response.error };
    return { error: null };
  },
};

const functions = {
  async invoke<T = any>(name: string, options: FunctionInvokeOptions = {}) {
    const headers = new Headers(options.headers ?? {});
    const session = readStoredSession();
    if (session?.access_token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
    headers.set("Content-Type", "application/json");

    const response = await fetch(`/api/functions/${name}`, {
      method: "POST",
      headers,
      body: JSON.stringify(options.body ?? {}),
    });

    const rawText = await response.text();
    const context = {
      async text() {
        return rawText;
      },
    };

    if (!response.ok) {
      return {
        data: null,
        error: new FunctionsHttpError(rawText || `Function ${name} failed`, context),
      };
    }

    return {
      data: rawText ? (JSON.parse(rawText) as T) : (null as T),
      error: null,
    };
  },
};

const storage = {
  from(bucket: string) {
    return {
      async upload(filePath: string, file: Blob | File | Uint8Array | ArrayBuffer, options?: { contentType?: string }) {
        try {
          const data = await blobToBase64(file);
          await apiRequest(`/api/storage/${bucket}/upload`, {
            method: "POST",
            body: JSON.stringify({
              path: filePath,
              data,
              contentType: options?.contentType ?? "application/octet-stream",
            }),
          });
          return { error: null };
        } catch (error) {
          return { error: { message: error instanceof Error ? error.message : "Upload failed" } };
        }
      },

      getPublicUrl(filePath: string) {
        return {
          data: {
            publicUrl: resolveUrl(`/storage/${bucket}/${filePath}`),
          },
        };
      },
    };
  },
};

export const supabase = {
  from<TData = unknown>(table: string) {
    return new QueryBuilder<TData>(table);
  },
  auth,
  functions,
  storage,
  hasRecoveryToken() {
    return Boolean(getRecoveryToken());
  },
  setRecoveryToken(token: string | null) {
    setRecoveryToken(token);
    if (token) emitAuth("PASSWORD_RECOVERY", null);
  },
};
