import {
    addSource,
    buildDraftBody,
    buildSaveBody,
    diffEntrypoints,
    isDirty,
    removeSource,
    setBaseSourceEnabled,
    setEnforcementMode,
    toEditable,
    toStored,
    undraftableChanges,
    unsafeTokensOf,
} from './draft.js'

const override = {
    schemaVersion: 1,
    appKey: 'maps',
    enabled: true,
    approvalNote: 'OPS-1',
    entrypoints: {
        '*': {
            enforcementMode: 'ENFORCE',
            enforced: {
                add: { 'img-src': ['https://saved.example.org'] },
                disabledBaseSources: [],
            },
            reportOnlyDraft: {
                enabled: true,
                expiresAt: '2099-01-01T00:00:00.000Z',
                add: { 'img-src': ['https://draft.example.org'] },
                disabledBaseSources: ['img-src https://tile.openstreetmap.org'],
            },
        },
    },
}

describe('toEditable', () => {
    it('folds an enabled draft into the enforced sources', () => {
        const editable = toEditable(override)
        expect(editable.entrypoints['*'].enforced).toEqual({
            add: {
                'img-src': [
                    'https://saved.example.org',
                    'https://draft.example.org',
                ],
            },
            disabledBaseSources: ['img-src https://tile.openstreetmap.org'],
        })
        expect(editable.entrypoints['*'].reportOnlyDraft.enabled).toBe(false)
    })

    it('shows a running draft as unsaved changes against the stored policy', () => {
        expect(isDirty(toStored(override), toEditable(override))).toBe(true)
        expect(isDirty(toStored(null), toEditable(null))).toBe(false)
    })
})

describe('buildSaveBody', () => {
    it('saves the editor as enforced policy, ends drafts and drops empty entrypoints', () => {
        let editable = toEditable(override)
        editable = addSource(editable, 'app', {
            directive: 'connect-src',
            source: 'https://api.example.org',
        })
        editable = addSource(editable, 'plugin', {
            directive: 'img-src',
            source: 'https://x.org',
        })
        editable = removeSource(editable, 'plugin', {
            directive: 'img-src',
            source: 'https://x.org',
        })
        const body = buildSaveBody(editable, { confirmUnsafe: true })

        expect(Object.keys(body.entrypoints).sort()).toEqual(['*', 'app'])
        expect(body.entrypoints['*'].reportOnlyDraft.enabled).toBe(false)
        expect(body.entrypoints['*'].enforced.add['img-src']).toContain(
            'https://draft.example.org'
        )
        expect(body.entrypoints.app.enforced.add).toEqual({
            'connect-src': ['https://api.example.org'],
        })
        expect(body.confirmUnsafe).toBe(true)
        expect(body.approvalNote).toBe('OPS-1')
    })
})

describe('buildDraftBody', () => {
    it('keeps the stored enforced policy and drafts only additions and removed defaults', () => {
        const stored = toStored(null)
        let editable = toEditable(null)
        editable = addSource(editable, 'app', {
            directive: 'img-src',
            source: 'https://wms.example.org',
        })
        editable = setBaseSourceEnabled(editable, '*', {
            directive: 'img-src',
            source: 'https://tile.openstreetmap.org',
            enabled: false,
        })
        const expiresAt = '2026-11-11T15:15:00.000Z'
        const body = buildDraftBody(stored, editable, { expiresAt })

        expect(body.entrypoints.app.enforced.add).toEqual({})
        expect(body.entrypoints.app.reportOnlyDraft).toEqual({
            enabled: true,
            expiresAt,
            add: { 'img-src': ['https://wms.example.org'] },
            disabledBaseSources: [],
        })
        expect(
            body.entrypoints['*'].reportOnlyDraft.disabledBaseSources
        ).toEqual(['img-src https://tile.openstreetmap.org'])
    })

    it('reports removals and mode changes as not draftable', () => {
        const stored = toStored({
            ...override,
            entrypoints: {
                '*': {
                    ...override.entrypoints['*'],
                    reportOnlyDraft: undefined,
                },
            },
        })
        let editable = toEditable(stored)
        editable = removeSource(editable, '*', {
            directive: 'img-src',
            source: 'https://saved.example.org',
        })
        editable = setEnforcementMode(editable, 'app', 'REPORT_ONLY_EXEMPT')
        expect(undraftableChanges(stored, editable)).toEqual([
            {
                ep: '*',
                kind: 'removed',
                directive: 'img-src',
                value: 'https://saved.example.org',
            },
            { ep: 'app', kind: 'mode' },
        ])
        expect(diffEntrypoints(stored, editable)['*'].removed).toEqual({
            'img-src': ['https://saved.example.org'],
        })
    })
})

describe('unsafeTokensOf', () => {
    it('lists unsafe script-src tokens in enforced and draft additions per entrypoint', () => {
        const body = {
            entrypoints: {
                '*': {
                    enforced: {
                        add: {
                            'script-src': ["'unsafe-eval'", 'https://cdn.org'],
                            'img-src': ['http://old.org'],
                        },
                    },
                    reportOnlyDraft: {
                        add: { 'script-src': ['https://*.cdn.org'] },
                    },
                },
            },
        }
        expect(unsafeTokensOf(body)).toEqual([
            "* script-src 'unsafe-eval'",
            '* script-src https://*.cdn.org',
        ])
    })
})
