import { findMissingSources, parseCspHeader } from './header.js'

describe('parseCspHeader', () => {
    it('parses directives, ignores empty parts and keeps the first duplicate', () => {
        expect(
            parseCspHeader(
                "Content-Security-Policy: default-src 'self';; img-src 'self' https://a.org; img-src https://b.org; upgrade-insecure-requests"
            )
        ).toEqual({
            'default-src': ["'self'"],
            'img-src': ["'self'", 'https://a.org'],
            'upgrade-insecure-requests': [],
        })
    })
})

describe('findMissingSources', () => {
    it('returns editable sources missing from the effective policy and flags locked directives', () => {
        const effective = "default-src 'self'; img-src 'self' https://a.org"
        const pasted =
            "img-src 'self' https://a.org https://wms.example.org; connect-src https://api.example.org; frame-ancestors *"
        expect(
            findMissingSources(pasted, effective, ['img-src', 'connect-src'])
        ).toEqual({
            candidates: [
                { directive: 'img-src', source: 'https://wms.example.org' },
                { directive: 'connect-src', source: 'https://api.example.org' },
            ],
            ignored: ['frame-ancestors'],
        })
    })
})
