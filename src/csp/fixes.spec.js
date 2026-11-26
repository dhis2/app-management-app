import {
    checkFix,
    decodeFix,
    encodeFix,
    fixForViolation,
    groupFixes,
} from './fixes.js'

const row = (patch) => ({
    appKey: 'event-reports',
    entrypoint: 'app',
    disposition: 'enforce',
    effectiveDirective: 'script-src',
    suggestable: false,
    count: 1,
    ...patch,
})

describe('fixForViolation', () => {
    it.each([
        ['EVAL', 'script-src', "'unsafe-eval'"],
        ['WASM_EVAL', 'script-src', "'wasm-unsafe-eval'"],
        ['INLINE', 'script-src-elem', "'unsafe-inline'"],
        ['INLINE', 'script-src-attr', "'unsafe-inline'"],
        ['BLOB', 'script-src', 'blob:'],
    ])(
        'maps a %s report on %s to script-src %s, marked unsafe',
        (kind, directive, value) => {
            expect(
                fixForViolation(
                    row({ violationKind: kind, effectiveDirective: directive })
                ).fix
            ).toEqual({
                entrypoint: 'app',
                directive: 'script-src',
                value,
                unsafe: true,
            })
        }
    )

    it('allows a suggestable external origin in the reported directive', () => {
        expect(
            fixForViolation(
                row({
                    violationKind: 'EXTERNAL',
                    effectiveDirective: 'connect-src',
                    suggestable: true,
                    suggestedDirective: 'connect-src',
                    suggestedSource: 'https://ows.terrestris.de',
                })
            ).fix
        ).toEqual({
            entrypoint: 'app',
            directive: 'connect-src',
            value: 'https://ows.terrestris.de',
            unsafe: false,
        })
    })

    it('never proposes a fix in a locked directive', () => {
        const result = fixForViolation(
            row({
                violationKind: 'EXTERNAL',
                effectiveDirective: 'frame-ancestors',
                suggestable: true,
                suggestedDirective: 'frame-ancestors',
                suggestedSource: 'https://evil.example.org',
            })
        )
        expect(result.fix).toBeNull()
        expect(result.reason).toMatch(/locked/)
    })

    it('has no fix for inline styles, keywords outside script-src or platform pages', () => {
        expect(
            fixForViolation(
                row({
                    violationKind: 'INLINE',
                    effectiveDirective: 'style-src-attr',
                })
            ).fix
        ).toBeNull()
        expect(fixForViolation(row({ violationKind: 'OTHER' })).fix).toBeNull()
        expect(
            fixForViolation(row({ appKey: '_platform', violationKind: 'EVAL' }))
                .fix
        ).toBeNull()
    })

    it('falls back to all entrypoints when the reported one is not offered', () => {
        expect(
            fixForViolation(
                row({ violationKind: 'EVAL', entrypoint: 'plugin' }),
                {
                    entrypoints: ['*', 'app'],
                }
            ).fix.entrypoint
        ).toBe('*')
    })

    const fontData = (patch) =>
        row({
            appKey: 'arcgis-connector',
            violationKind: 'DATA',
            effectiveDirective: 'font-src',
            blocked: 'data',
            count: 3,
            ...patch,
        })
    const fontDataFix = {
        entrypoint: 'app',
        directive: 'font-src',
        value: 'data:',
        unsafe: true,
    }

    it('allows a blocked data: font in font-src, marked unsafe', () => {
        expect(
            fixForViolation(
                fontData({
                    suggestable: true,
                    suggestedDirective: 'font-src',
                    suggestedSource: 'data:',
                })
            ).fix
        ).toEqual(fontDataFix)
        // a server that does not mark the row suggestable gets the same fix
        expect(fixForViolation(fontData()).fix).toEqual(fontDataFix)
    })

    it('has no fix for data: outside script-src and font-src', () => {
        const result = fixForViolation(
            fontData({ effectiveDirective: 'media-src' })
        )
        expect(result.fix).toBeNull()
        expect(result.reason).toBe('Only script-src and font-src take data:')
        expect(
            fixForViolation(fontData({ violationKind: 'BLOB' })).fix
        ).toBeNull()
    })
})

describe('checkFix', () => {
    it('rejects values the server rejects, such as a bare * outside script-src', () => {
        expect(
            checkFix({ entrypoint: '*', directive: 'img-src', value: '*' }).fix
        ).toBeNull()
        expect(
            checkFix({
                entrypoint: '*',
                directive: 'default-src',
                value: 'https://x.org',
            }).fix
        ).toBeNull()
    })
})

describe('groupFixes', () => {
    it('merges rows needing the same fix, counts hits and skips report-only rows', () => {
        const groups = groupFixes([
            row({ violationKind: 'EVAL', count: 4 }),
            row({
                violationKind: 'EVAL',
                count: 2,
                sampleSourceFile: 'other.js',
            }),
            row({ violationKind: 'INLINE', count: 9 }),
            row({ violationKind: 'EVAL', count: 50, disposition: 'report' }),
        ])
        expect(groups.map((g) => [g.value, g.count, g.rows])).toEqual([
            ["'unsafe-inline'", 9, 1],
            ["'unsafe-eval'", 6, 2],
        ])
    })

    it('counts a blocked data: font among the fixes', () => {
        const groups = groupFixes([
            row({
                appKey: 'arcgis-connector',
                violationKind: 'DATA',
                effectiveDirective: 'font-src',
                count: 3,
            }),
        ])
        expect(groups).toEqual([
            {
                entrypoint: 'app',
                directive: 'font-src',
                value: 'data:',
                unsafe: true,
                count: 3,
                rows: 1,
            },
        ])
    })
})

describe('encodeFix / decodeFix', () => {
    it('round-trips a fix through the URL value', () => {
        const fix = {
            entrypoint: 'app',
            directive: 'script-src',
            value: "'unsafe-eval'",
        }
        expect(decodeFix(encodeFix(fix))).toEqual(fix)
        expect(decodeFix('garbage')).toBeNull()
    })
})
