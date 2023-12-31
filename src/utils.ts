// @ts-expect-error: export conditions for single API
import { subtle } from 'unjwt/crypto'

export const DEFAULT_SIGNATURE_METHOD = 'HMAC'
export const DEFAULT_HASH_METHODS = 'SHA-256'
export const textEncoder = new TextEncoder()

export async function createSignature(
  key: CryptoKey,
  algorithm: string,
  data: string,
) {
  const encoded = textEncoder.encode(data)
  const signature = await subtle.sign(algorithm, key, encoded)
  return encodeToBase64Url(signature)
}

export async function importKey(options: {
  secret: string
  usage?: 'sign' | 'verify'
  name: string
  hash: string
}) {
  const {
    secret,
    usage = 'sign',
    name = DEFAULT_SIGNATURE_METHOD,
    hash = DEFAULT_HASH_METHODS,
  } = { ...options }

  const encodedKey = textEncoder.encode(secret)
  return await subtle.importKey(
    'raw',
    encodedKey,
    { name, hash },
    false,
    [usage],
  )
}

export function encodeToBase64Url(input: unknown) {
  let data: Uint8Array
  if (typeof input === 'string')
    data = textEncoder.encode(input)

  else if (input instanceof ArrayBuffer)
    data = new Uint8Array(input)

  else
    data = textEncoder.encode(JSON.stringify(input))

  const base64 = btoa(String.fromCodePoint(...data))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeFromBase64Url(base64Url: string) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  return atob(base64)
}

export function decodeFromBase64UrlToBuffer(base64Url: string) {
  const bytes = decodeFromBase64Url(base64Url)
  const buffer = Uint8Array.from(bytes, c => c.codePointAt(0)!)
  return buffer.buffer
}
