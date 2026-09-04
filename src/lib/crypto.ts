import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Encryption at rest for the credentials customers hand us.
 *
 * A GitHub token, a WordPress application password or a Shopify Admin token is
 * write access to someone else's business. Storing those as plaintext columns
 * means one leaked database backup is a compromise of every customer at once,
 * so they are encrypted with a key that lives only in the environment and is
 * never in the database or the repository.
 *
 * AES-256-GCM, random 12-byte IV per record, auth tag stored alongside. GCM is
 * chosen over CBC because it authenticates: a tampered ciphertext fails to
 * decrypt rather than silently yielding attacker-chosen bytes.
 */

const KEY_ENV = "CREDENTIAL_KEY";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const VERSION = "v1";

export class CredentialKeyMissing extends Error {
  constructor() {
    super(
      `${KEY_ENV} is not set. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
    );
  }
}

function key(): Buffer {
  const raw = process.env[KEY_ENV];
  if (!raw) throw new CredentialKeyMissing();
  const buf = Buffer.from(raw, "base64");
  // A short key would still "work" in the sense that Node pads or throws
  // inconsistently across versions. Refuse it explicitly instead.
  if (buf.length !== 32) throw new Error(`${KEY_ENV} must decode to exactly 32 bytes (got ${buf.length}).`);
  return buf;
}

/** True when the app is able to store credentials at all. */
export function credentialsCanBeStored(): boolean {
  try {
    key();
    return true;
  } catch {
    return false;
  }
}

/** Returns a self-describing string: v1.<iv>.<tag>.<ciphertext>, all base64url. */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) throw new Error("Refusing to encrypt an empty secret.");
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), body.toString("base64url")].join(".");
}

export function decryptSecret(stored: string): string {
  const parts = stored.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) throw new Error("Stored credential is not in a recognised format.");
  const [, ivB64, tagB64, bodyB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) throw new Error("Stored credential is malformed.");

  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(Buffer.from(bodyB64, "base64url")), decipher.final()]).toString("utf8");
}

/**
 * A non-secret fragment for the UI, so someone can tell which credential is
 * stored without us ever showing it back. Short secrets get no hint at all
 * rather than a hint that is most of the secret.
 */
export function secretHint(plaintext: string): string {
  return plaintext.length >= 12 ? `${plaintext.slice(0, 4)}…${plaintext.slice(-4)}` : "••••";
}

/** Constant-time compare for anywhere a secret is checked against user input. */
export function secretsMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
