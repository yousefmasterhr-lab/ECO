// Cloudflare Pages Functions - Core Security, Auth (PBKDF2 + HS256 JWT), CORS & Types

export interface Env {
  DB: D1Database;
  DOCS_VAULT: R2Bucket;
  JWT_SECRET?: string;
  BRIDGE_SHARED_SECRET?: string;
  ALLOWED_ORIGINS?: string;
  NODE_ENV?: string;
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: any;
  error?: string;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec<T = unknown>(query: string): Promise<D1Result<T>>;
}

export interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: Record<string, string>;
  customMetadata?: Record<string, string>;
  writeHttpMetadata?(headers: Headers): void;
}

export interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
  blob(): Promise<Blob>;
}

export interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
    options?: {
      httpMetadata?: Record<string, string>;
      customMetadata?: Record<string, string>;
    }
  ): Promise<R2Object>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    objects: R2Object[];
    truncated: boolean;
    cursor?: string;
  }>;
}

export interface AuthTokenPayload {
  sub: string;
  id: string;
  role: string;
  username?: string;
  email?: string;
  permissions?: string[];
  iat: number;
  exp: number;
}

export interface EventContext<TEnv = Env, TParams = any, TData = Record<string, any>> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: TEnv;
  params: TParams;
  data: TData;
}

export type PagesFunction<TEnv = Env> = (
  context: EventContext<TEnv>
) => Response | Promise<Response>;

// ============================================================================
// Strict CORS Allowlist (RULE-011: Zero wildcard '*' / Zero blind reflection)
// ============================================================================
const DEFAULT_ALLOWED_ORIGINS = ['https://eco.hrsup.com'];

function isLocalhostHost(host: string): boolean {
  const h = (host || '').toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('localhost:') || h.startsWith('127.0.0.1:');
}

export function isOriginAllowed(origin: string | null, env?: Partial<Env>, requestUrl?: string): boolean {
  if (!origin) return false;
  const cleanOrigin = origin.trim().replace(/\/+$/, '');
  const configured = (env?.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter((o) => Boolean(o) && o !== '*');

  const allowlist = configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;
  if (allowlist.includes(cleanOrigin)) return true;

  // Permit localhost dev origins strictly when not in production
  const isProd = (env?.NODE_ENV || '').toLowerCase() === 'production';
  if (!isProd) {
    try {
      const parsedOrigin = new URL(cleanOrigin);
      const isOriginLocal = parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1';
      if (isOriginLocal) {
        if (!requestUrl) return true;
        const reqHost = new URL(requestUrl).host;
        if (isLocalhostHost(reqHost)) return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

export function buildCorsHeaders(request?: Request, env?: Partial<Env>): Record<string, string> {
  const origin = request?.headers.get('Origin') || null;
  const headers: Record<string, string> = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Bridge-Secret, X-Database-Context, X-Database-Key',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  if (origin && isOriginAllowed(origin, env, request?.url)) {
    headers['Access-Control-Allow-Origin'] = origin.trim().replace(/\/+$/, '');
  }
  return headers;
}

export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
  request?: Request,
  env?: Partial<Env>
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...buildCorsHeaders(request, env),
      ...extraHeaders,
    },
  });
}

export function errorResponse(
  message: string,
  status = 400,
  details?: unknown,
  request?: Request,
  env?: Partial<Env>
): Response {
  const body: Record<string, unknown> = { success: false, error: message };
  if (details !== undefined) body.details = details;
  return jsonResponse(body, status, {}, request, env);
}

export function handleOptions(request?: Request, env?: Partial<Env>): Response {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request, env),
  });
}

// ============================================================================
// Constant-Time Helpers & PBKDF2-SHA256 Password Hashing (RULE-007)
// ============================================================================
const PBKDF2_PREFIX = 'pbkdf2_sha256';
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LEN_BITS = 256;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  const enc = new TextEncoder();
  return timingSafeEqualBytes(enc.encode(a), enc.encode(b));
}

async function derivePbkdf2Bytes(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    baseKey,
    PBKDF2_KEY_LEN_BITS
  );
  return new Uint8Array(derived);
}

export async function sha256Hex(value: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Generates a salted PBKDF2-SHA256 hash: `pbkdf2_sha256$100000$<saltHex>$<derivedHex>`
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const derived = await derivePbkdf2Bytes(password, salt, PBKDF2_ITERATIONS);
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(derived)}`;
}

/**
 * Verifies a password with constant-time comparison.
 * Supports transparent upgrade from legacy unsalted SHA-256 or legacy plaintext rows (Zero Lockout),
 * with ZERO universal/master backdoor passwords.
 */
export async function verifyPassword(
  rawPassword: string,
  storedHash: string | null | undefined
): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  if (!rawPassword || !storedHash) {
    return { valid: false, needsUpgrade: false };
  }

  // 1. Modern salted PBKDF2-SHA256 format
  if (storedHash.startsWith(`${PBKDF2_PREFIX}$`)) {
    const parts = storedHash.split('$');
    if (parts.length !== 4) return { valid: false, needsUpgrade: false };
    const iterations = parseInt(parts[1], 10);
    const salt = hexToBytes(parts[2]);
    const expected = hexToBytes(parts[3]);
    if (!salt || !expected || !Number.isFinite(iterations) || iterations < 10000) {
      return { valid: false, needsUpgrade: false };
    }
    const actual = await derivePbkdf2Bytes(rawPassword, salt, iterations);
    return { valid: timingSafeEqualBytes(actual, expected), needsUpgrade: false };
  }

  // 2. Legacy 64-hex unsalted SHA-256 -> verify in constant time and signal transparent upgrade
  if (/^[0-9a-fA-F]{64}$/.test(storedHash)) {
    const legacyHex = await sha256Hex(rawPassword);
    const actual = hexToBytes(legacyHex)!;
    const expected = hexToBytes(storedHash.toLowerCase())!;
    const ok = timingSafeEqualBytes(actual, expected);
    return { valid: ok, needsUpgrade: ok };
  }

  // 3. Legacy plaintext password in existing DB row -> constant-time check + transparent upgrade
  const ok = timingSafeEqualStrings(rawPassword, storedHash);
  return { valid: ok, needsUpgrade: ok };
}

// ============================================================================
// Cryptographically Signed HS256 JWT (RULE-008: Fail-Closed in Production)
// ============================================================================
const DEV_ONLY_FALLBACK_JWT_SECRET = 'eco-erp-local-dev-only-jwt-secret-do-not-use-in-prod';

export function resolveJwtSecret(env?: Partial<Env>, requestUrl?: string): string | null {
  const configured = (env?.JWT_SECRET || '').trim();
  if (configured.length >= 16) {
    return configured;
  }

  const isProd = (env?.NODE_ENV || '').toLowerCase() === 'production';
  if (!isProd && requestUrl) {
    try {
      const u = new URL(requestUrl);
      if (isLocalhostHost(u.host)) {
        console.warn('[SECURITY WARNING] JWT_SECRET not configured; using dev-only localhost fallback.');
        return DEV_ONLY_FALLBACK_JWT_SECRET;
      }
    } catch {
      return null;
    }
  }
  return null;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(b64u: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(b64u)) return null;
  let b64 = b64u.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  try {
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

export async function createSessionToken(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds = 7 * 24 * 60 * 60
): Promise<string> {
  if (!secret || secret.trim().length < 16) {
    throw new Error('JWT_SECRET must be configured (minimum 16 characters)');
  }
  const iat = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === 'number' ? payload.exp : iat + expiresInSeconds;
  const sub = String(payload.sub || payload.id || '');
  const fullPayload = {
    ...payload,
    sub,
    id: sub,
    role: String(payload.role || ''),
    iat,
    exp,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = new TextEncoder();
  const encodedHeader = bytesToBase64Url(enc.encode(JSON.stringify(header)));
  const encodedPayload = bytesToBase64Url(enc.encode(JSON.stringify(fullPayload)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const encodedSignature = bytesToBase64Url(new Uint8Array(signatureBuffer));

  return `${dataToSign}.${encodedSignature}`;
}

export async function verifySessionToken(
  token: string,
  secret: string | null | undefined
): Promise<AuthTokenPayload | null> {
  try {
    if (!token || !secret || secret.trim().length < 16) return null;
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some((p) => !p)) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const headerBytes = base64UrlToBytes(encodedHeader);
    const payloadBytes = base64UrlToBytes(encodedPayload);
    const signatureBytes = base64UrlToBytes(encodedSignature);
    if (!headerBytes || !payloadBytes || !signatureBytes) return null;

    const dec = new TextDecoder();
    const header = JSON.parse(dec.decode(headerBytes));
    // Strictly enforce HS256 — explicitly reject alg: "none", RS256, or missing alg
    if (!header || header.alg !== 'HS256' || (header.typ && header.typ !== 'JWT')) {
      return null;
    }

    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const key = await getHmacKey(secret);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as BufferSource,
      new TextEncoder().encode(dataToSign)
    );
    if (!isValid) return null;

    const payload = JSON.parse(dec.decode(payloadBytes));
    const sub = String(payload?.sub || payload?.id || '').trim();
    if (!sub || typeof payload?.exp !== 'number') return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (nowSec >= payload.exp) return null;

    return {
      ...payload,
      sub,
      id: sub,
      role: String(payload.role || ''),
      iat: Number(payload.iat || 0),
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
