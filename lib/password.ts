import { createHash } from 'crypto'
import { text } from 'stream/consumers'


export function hashPassword(input: string): string {
  const hash = createHash('sha1')
  hash.update(input)
  return hash.digest('hex')
}


export async function verifyPassword(plain: string, hash: string) {
  const passe = hashPassword(plain)
  return passe === hash
}
