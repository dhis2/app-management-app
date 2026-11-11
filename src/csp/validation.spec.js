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

    it('rejects data: and blob: outside script-src', () => {
        expect(code('img-src', 'data:')).toBe('WILDCARD_NOT_ALLOWED')
        expect(code('font-src', 'data:')).toBe('WILDCARD_NOT_ALLOWED')
        expect(code('media-src', 'blob:')).toBe('WILDCARD_NOT_ALLOWED')
    })

    it('allows host wildcards with two labels only in img-src, connect-src and script-src', () => {
        expect(code('img-src', 'https://*.example.org')).toBeNull()
        expect(code('connect-src', 'https://*.example.org')).toBeNull()
        expect(code('script-src', 'https://*.example.org')).toBeNull()
        expect(code('frame-src', 'https://*.example.org')).toBe(
            'WILDCARD_NOT_ALLOWED'
        )
        expect(code('form-action', 'https://*.example.org')).toBe(
            'WILDCARD_NOT_ALLOWED'
        )
        expect(code('img-src', 'https://*.org')).toBe('WILDCARD_NOT_ALLOWED')
        expect(code('img-src', 'https://a.*.org')).toBe('WILDCARD_NOT_ALLOWED')
    })

    it('allows websocket origins only in connect-src', () => {
        expect(code('connect-src', 'wss://live.example.org')).toBeNull()
        expect(code('img-src', 'wss://live.example.org')).toBe('INVALID_SOURCE')
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
            "'report-sample'",
        ].forEach((value) => expect(code('script-src', value)).toBeNull())
        expect(code('script-src', "'nonce-abc'")).toBe('KEYWORD_NOT_ALLOWED')
        expect(code('script-src', "'bogus'")).toBe('KEYWORD_NOT_ALLOWED')
        expect(code('script-src', "'none'")).toBe('KEYWORD_NOT_ALLOWED')
    })

    it("rejects keywords outside script-src, except the no-op 'self'", () => {
        expect(code('img-src', "'self'")).toBeNull()
        expect(code('style-src', "'unsafe-inline'")).toBe('KEYWORD_NOT_ALLOWED')
        expect(code('img-src', "'unsafe-eval'")).toBe('KEYWORD_NOT_ALLOWED')
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
    it('flags the server unsafe token list in script-src', () => {
        ;[
            "'unsafe-inline'",
            "'unsafe-eval'",
            "'wasm-unsafe-eval'",
            "'unsafe-hashes'",
            '*',
            'data:',
            'blob:',
            'http:',
            'https:',
            'http://legacy.example.org',
            'https://*.example.org',
        ].forEach((value) =>
            expect(isUnsafeSource(value, 'script-src')).toBe(true)
        )
    })

    it('does not flag https origins, safe keywords or other directives', () => {
        ;["'self'", "'strict-dynamic'", 'https://x.org'].forEach((value) =>
            expect(isUnsafeSource(value, 'script-src')).toBe(false)
        )
        expect(isUnsafeSource('http://legacy.example.org', 'img-src')).toBe(
            false
        )
    })
})
