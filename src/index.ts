import {
  DEFAULT_HASH_METHODS,
  DEFAULT_SIGNATURE_METHOD,
  createSignature,
  decodeFromBase64Url,
  decodeFromBase64UrlToBuffer,
  encodeToBase64Url,
  importKey,
  textEncoder,
} from './utils'
import type { JWTRegisteredClaims } from './types'

export { JWTRegisteredClaims }

export async function signJWT<
  T extends Record<string, any> = Record<string, any>,
>({
  payload = {} as T,
  secret,
  issuer,
  audience,
  expires = 30,
  header = { typ: 'JWT', alg: 'HS256' },
  signatureMethod = DEFAULT_SIGNATURE_METHOD,
  hashMethod = DEFAULT_HASH_METHODS,
}: {
  payload?: T
  secret: string
  issuer: string
  audience: string
  /**
   * Expiration time in days
   * @default 30
   */
  expires?: number
  /** @default { typ: 'JWT', alg: 'HS256' } */
  header?: Record<string, any>
  /** @default 'HMAC' */
  signatureMethod?: string
  /** @default 'SHA-256' */
  hashMethod?: string
}) {
  const key = await importKey({
    secret,
    name: signatureMethod,
    hash: hashMethod,
  })
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + expires * 24 * 60 * 60
  const jwtPayload: JWTRegisteredClaims & T = {
    ...payload,
    iss: issuer,
    aud: audience,
    iat,
    exp,
  }

  const signature = await createSignature(
    key,
    signatureMethod,
    `${encodeToBase64Url(header)}.${encodeToBase64Url(jwtPayload)}`,
  )
  return `${encodeToBase64Url(header)}.${encodeToBase64Url(
    jwtPayload,
  )}.${signature}`
}

export async function verifyJWT({
  token,
  secret,
  issuer,
  audience,
  leeway = 60,
  signatureMethod = DEFAULT_SIGNATURE_METHOD,
  hashMethod = DEFAULT_HASH_METHODS,
}: {
  token: string
  secret: string
  issuer: string
  audience: string
  /** @default 60 */
  leeway?: number
  /** @default 'HMAC' */
  signatureMethod?: string
  /** @default 'SHA-256' */
  hashMethod?: string
}) {
  const [header, payload, signature] = token.split('.')
  const key = await importKey({
    secret,
    usage: 'verify',
    name: signatureMethod,
    hash: hashMethod,
  })

  const isValid = await crypto.subtle.verify(
    signatureMethod,
    key,
    decodeFromBase64UrlToBuffer(signature),
    textEncoder.encode(`${header}.${payload}`),
  )

  if (!isValid)
    throw new Error('Invalid JWT signature')

  const decodedPayload = JSON.parse(
    decodeFromBase64Url(payload),
  ) as JWTRegisteredClaims
  const now = Math.floor(Date.now() / 1000)

  if (
    issuer !== decodedPayload.iss
    || (Array.isArray(decodedPayload.aud)
      ? !decodedPayload.aud.includes(audience)
      : audience !== decodedPayload.aud)
    || (decodedPayload.exp && now > decodedPayload.exp + leeway)
    || (decodedPayload.nbf && now < decodedPayload.nbf - leeway)
  )
    throw new Error('Invalid JWT claims')
}

export function decodeJWT<T extends Record<string, any> = Record<string, any>>(
  token: string,
) {
  const parts = token.split('.')
  if (parts.length !== 3)
    throw new Error('Invalid token format')

  const [, payload] = parts
  return JSON.parse(decodeFromBase64Url(payload)) as JWTRegisteredClaims & T
}
