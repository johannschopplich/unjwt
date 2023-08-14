# unjwt

> Easy creation and verification of JSON Web Tokens (JWT).

You may just use [Jose](https://github.com/panva/jose) or one of the other libraries out there. But I wanted to take my shot at creating a JWT library that is easy to use and has zero dependencies.

## Features

- 📦 Works in Node, browser and workers
- 💨 Zero dependencies except [`uncrypto`](https://github.com/unjs/uncrypto) for conditional Web Crypto API support

## Installation

Run the following command to add `unjwt` to your project.

```bash
# pnpm
pnpm add unjwt

# npm
npm install unjwt

# yarn
yarn add unjwt
```

## Usage

```ts
import { decodeJWT, signJWT, verifyJWT } from 'unjwt'

interface JWTUserClaims {
  email: string
}

const secret = 'secret'
const issuer = 'https://domain.com'

// Sign a JWT
const accessToken = await signJWT<JWTUserClaims>({
  payload: {
    email: 'user@domain.com'
  },
  secret,
  issuer,
  audience: issuer,
})

// Verify a JWT
try {
  const verifiedAccessToken = await verifyJWT({
    token: accessToken,
    secret,
    issuer,
    audience: issuer
  })
}
catch (error) {
  // Handle error
  console.error(error)
}

// Decode a JWT – does not verify the signature
const decodedAccessToken = await decodeJWT<JWTUserClaims>(accessToken)
console.log(decodedAccessToken.email)
```

## License

[MIT](./LICENSE) License © 2023-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
