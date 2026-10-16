import { createHash, timingSafeEqual } from "crypto";
import bcrypt from "bcrypt";

const ROUNDS = 12;

/** Gera o hash (bcrypt, com salt) de uma senha nova. */
export async function hashPassword(input: string): Promise<string> {
  return bcrypt.hash(input, ROUNDS);
}

/** Hashes antigos eram SHA-1 sem salt; os de bcrypt começam por "$2". */
export function isLegacyHash(hash: string): boolean {
  return !hash.startsWith("$2");
}

function legacySha1(input: string) {
  return createHash("sha1").update(input).digest("hex");
}

/**
 * Valida a senha. Continua a aceitar os hashes SHA-1 antigos para que as
 * contas existentes entrem — e `auth.ts` converte-os para bcrypt no 1.º login.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!isLegacyHash(hash)) return bcrypt.compare(plain, hash);

  const a = Buffer.from(legacySha1(plain));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}
