import nodeCrypto from 'node:crypto'

export const subtle = (nodeCrypto.webcrypto?.subtle || {}) as Crypto['subtle']

export const randomUUID: Crypto['randomUUID'] = () => {
  return nodeCrypto.randomUUID()
}

export const getRandomValues: Crypto['getRandomValues'] = (array: any) => {
  return nodeCrypto.webcrypto.getRandomValues(array)
}
