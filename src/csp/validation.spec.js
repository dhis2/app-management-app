import { isUnsafeSource, validateSource } from './validation.js'

const code = (directive, value, options) =>
    validateSource(directive, value, options)?.code ?? null

describe('validateSource', () => {
    it('accepts bare https origins with and without port', () => {
        expect(code('img-src', 'https://tiles.example.org')).toBeNull()
        expect(code('connect-src', 'https://api.example.org:8443')).toBeNull()
        expect(code('connect-src', 'wss://live.example.org')).toBeNull()
    })

    it('rejects paths, queries and trailing slashes', () => {
        expect(code('img-src', 'https://x.org/tiles')).toBe('PATH_NOT_ALLOWED')
        expect(code('img-src', 'https://x.org/')).toBe('PATH_NOT_ALLOWED')
        expect(code('img-src', 'https://x.org?a=1')).toBe('PATH_NOT_ALLOWED')
    })

    it('rejects bare * and bare schemes outside script-src', () => {
        expect(code('img-src', '*')).toBe('WILDCARD_NOT_ALLOWED')
        expect(code('connect-src', 'https:')).toBe('WILDCARD_NOT_ALLOWED')
        expect(code('frame-src', 'data:')).toBe('WILDCARD_NOT_ALLOWED')
    })

    it('allows data: and blob: only where the baseline uses them', () => {
        expect(code('img-src', 'data:')).toBeNull()
        expect(code('font-src', 'data:')).toBeNull()
        expect(code('media-src', 'blob:')).toBeNull()
        expect(code('style-src', 'data:')).toBe('WILDCARD_NOT_ALLOWED')
    })

    it('allows host wildcards only in img-src and connect-src with two labels', () => {
        expect(code('img-src', 'https://*.example.org')).toBeNull()
        expect(code('connect-src', 'https://*.example.org')).toBeNull()
        expect(code('frame-src', 'https://*.example.org')).toBe(
            'WILDCARD_NOT_ALLOWED'
        )
        expect(code('script-src', 'https://*.example.org')).toBe(
            'WILDCARD_NOT_ALLOWED'
        )
        expect(code('img-src', 'https://*.org')).toBe('WILDCARD_NOT_ALLOWED')
        expect(code('img-src', 'https://a.*.org')).toBe('WILDCARD_NOT_ALLOWED')
    })

    it('accepts every script-src keyword except nonces', () => {
        ;[
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "'wasm-unsafe-eval'",
            "'unsafe-hashes'",
            "'strict-dynamic'",
            "'sha256-abcDEF123+/='",
            '*',
            'https:',
            'data:',
            'blob:',
        ].forEach((value) => expect(code('script-src', value)).toBeNull())
        expect(code('script-src', "'nonce-abc'")).toBe('KEYWORD_NOT_ALLOWED')
        expect(code('script-src', "'bogus'")).toBe('KEYWORD_NOT_ALLOWED')
    })

    it('rejects keywords outside script-src', () => {
        expect(code('img-src', "'self'")).toBe('KEYWORD_NOT_ALLOWED')
        expect(code('style-src', "'unsafe-inline'")).toBe('KEYWORD_NOT_ALLOWED')
    })

    it('rejects plain http and ws only when the server runs on https', () => {
        expect(code('img-src', 'http://x.org')).toBeNull()
        expect(code('img-src', 'http://x.org', { httpsOnly: true })).toBe(
            'INSECURE_SCHEME'
        )
        expect(code('connect-src', 'ws://x.org', { httpsOnly: true })).toBe(
            'INSECURE_SCHEME'
        )
        expect(code('script-src', 'http:', { httpsOnly: true })).toBe(
            'INSECURE_SCHEME'
        )
    })

    it('rejects separators, user info and odd schemes', () => {
        expect(code('img-src', 'https://a.org https://b.org')).toBe(
            'INVALID_CHARACTERS'
        )
        expect(code('img-src', 'https://a.org;')).toBe('INVALID_CHARACTERS')
        expect(code('img-src', 'https://user@a.org')).toBe('INVALID_SOURCE')
        expect(code('img-src', 'ftp://a.org')).toBe('INVALID_SOURCE')
        expect(code('img-src', 'tiles.example.org')).toBe('INVALID_SOURCE')
        expect(code('img-src', 'https://a.org:99999')).toBe('INVALID_SOURCE')
    })
})

describe('isUnsafeSource', () => {
    it('flags the server unsafe token list', () => {
        ;[
            "'unsafe-inline'",
            "'unsafe-eval'",
            "'wasm-unsafe-eval'",
            "'unsafe-hashes'",
            '*',
            'data:',
            'http:',
            'http://legacy.example.org',
        ].forEach((value) => expect(isUnsafeSource(value)).toBe(true))
    })

    it('does not flag https origins or safe keywords', () => {
        ;["'self'", "'strict-dynamic'", 'https://x.org', 'blob:'].forEach(
            (value) => expect(isUnsafeSource(value)).toBe(false)
        )
    })
})
