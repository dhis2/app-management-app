import { CustomDataProvider, Provider } from '@dhis2/app-runtime'
import { render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { MockAlertStack } from '../../test-utils/index.js'
import { CspPolicy } from './CspPolicy.jsx'

const detail = {
    appKey: 'maps',
    name: 'Maps',
    bundled: true,
    entrypoints: {
        app: '/api/apps/maps/index.html',
        plugin: '/api/apps/maps/plugin.html',
    },
    overridableDirectives: [
        'connect-src',
        'img-src',
        'frame-src',
        'font-src',
        'style-src',
        'media-src',
        'script-src',
    ],
    lockedDirectives: [
        'default-src',
        'object-src',
        'base-uri',
        'frame-ancestors',
    ],
    baseline: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'frame-ancestors': ["'self'"],
    },
    baseOverrides: { '*': { 'img-src': ['https://tile.openstreetmap.org'] } },
    suggestions: [
        {
            directive: 'connect-src',
            source: 'https://dev.virtualearth.net',
            reason: 'BING_MAPS_KEY',
            detail: 'Bing Maps API key is configured',
            alreadyAllowed: false,
        },
    ],
    override: null,
    effective: {
        '*': {
            enforcementMode: 'ENFORCE',
            contentSecurityPolicy: "default-src 'self'; frame-ancestors 'self'",
            contentSecurityPolicyReportOnly: null,
        },
    },
    recentViolations: [],
}

const violations = [
    {
        id: '1',
        appKey: 'maps',
        entrypoint: 'app',
        disposition: 'enforce',
        effectiveDirective: 'img-src',
        blocked: 'https://wms.example.org',
        violationKind: 'EXTERNAL',
        suggestable: true,
        suggestedDirective: 'img-src',
        suggestedSource: 'https://wms.example.org',
        count: 12,
        firstSeen: '2026-11-11T15:01:00.000Z',
        lastSeen: '2026-11-11T15:04:00.000Z',
        status: 'NEW',
    },
]

const renderPolicy = ({
    path = '/installed-app/maps?tab=csp',
    detailPatch = {},
    rows = violations,
} = {}) => {
    const puts = []
    const data = {
        'security/csp/apps': {
            reportingEnabled: true,
            httpsOnly: false,
            apps: [],
        },
        'security/csp/apps/maps': (type, query) => {
            if (type === 'replace') {
                puts.push(query.data)
                return { ...query.data, schemaVersion: 1, appKey: 'maps' }
            }
            return { ...detail, ...detailPatch }
        },
        'security/csp/apps/maps/validate': {
            valid: true,
            errors: [],
            warnings: [],
            effective: {},
        },
        'security/csp/apps/maps/reports': { violations: rows },
    }
    const result = render(<CspPolicy appKey="maps" appName="Maps" />, {
        wrapper: ({ children }) => (
            <MemoryRouter initialEntries={[path]}>
                <Provider config={{ baseUrl: 'http://dhis2', apiVersion: 43 }}>
                    <CustomDataProvider data={data}>
                        {children}
                        <MockAlertStack />
                    </CustomDataProvider>
                </Provider>
            </MemoryRouter>
        ),
    })
    return { ...result, puts }
}

const inputIn = (element) => element.querySelector('input')

describe('CspPolicy', () => {
    it('stages a reported origin with "+ Allow origin" and saves it for that entrypoint', async () => {
        const user = userEvent.setup()
        const { findByTestId, getByTestId, puts } = renderPolicy()

        await user.click(await findByTestId('csp-allow-origin'))

        const imgRow = getByTestId('csp-directive-img-src')
        expect(within(imgRow).getByText('https://wms.example.org')).toBeTruthy()
        expect(getByTestId('csp-dirty-state').textContent).toContain(
            'App (index.html)'
        )

        await user.click(getByTestId('csp-apply'))
        await waitFor(() => expect(puts).toHaveLength(1))
        expect(puts[0].entrypoints.app.enforced.add).toEqual({
            'img-src': ['https://wms.example.org'],
        })
        expect(puts[0].confirmUnsafe).toBe(false)
        expect(puts[0].confirmExempt).toBe(false)
    })

    it('blocks a source with a path before it reaches the draft', async () => {
        const user = userEvent.setup()
        const { findByTestId, getByTestId, findByText } = renderPolicy()

        const field = await findByTestId('csp-add-input-img-src')
        await user.type(inputIn(field), 'https://wms.example.org/tiles')

        expect(
            await findByText(/Only bare origins .* are allowed/)
        ).toBeTruthy()
        expect(getByTestId('csp-add-button-img-src')).toBeDisabled()
    })

    it('needs an explicit confirmation before saving an unsafe script-src token', async () => {
        const user = userEvent.setup()
        const { findByTestId, getByTestId, puts } = renderPolicy()

        const field = await findByTestId('csp-add-input-script-src')
        await user.type(inputIn(field), "'unsafe-eval'{enter}")
        expect(
            within(getByTestId('csp-directive-script-src')).getByText(
                'Unsafe script sources'
            )
        ).toBeTruthy()

        await user.click(getByTestId('csp-apply'))
        const modal = await findByTestId('csp-unsafe-modal')
        expect(puts).toHaveLength(0)
        expect(within(modal).getByTestId('csp-unsafe-confirm')).toBeDisabled()

        await user.click(
            inputIn(within(modal).getByTestId('csp-unsafe-understood'))
        )
        await user.click(within(modal).getByTestId('csp-unsafe-confirm'))

        await waitFor(() => expect(puts).toHaveLength(1))
        expect(puts[0].confirmUnsafe).toBe(true)
        expect(puts[0].entrypoints['*'].enforced.add['script-src']).toEqual([
            "'unsafe-eval'",
        ])
    })

    it('exempts an entrypoint only after a reason and confirmation', async () => {
        const user = userEvent.setup()
        const { findByTestId, puts } = renderPolicy()

        await user.click(inputIn(await findByTestId('csp-exempt-toggle')))
        const modal = await findByTestId('csp-exempt-modal')
        const confirm = within(modal).getByTestId('csp-exempt-confirm')

        await user.click(
            inputIn(within(modal).getByTestId('csp-exempt-understood'))
        )
        expect(confirm).toBeDisabled()

        await user.type(
            within(modal)
                .getByTestId('csp-exempt-note')
                .querySelector('textarea'),
            'Vendor app injects inline scripts, ticket OPS-9'
        )
        await user.click(confirm)

        await waitFor(() => expect(puts).toHaveLength(1))
        expect(puts[0].confirmExempt).toBe(true)
        expect(puts[0].approvalNote).toBe(
            'Vendor app injects inline scripts, ticket OPS-9'
        )
        expect(puts[0].entrypoints['*'].enforcementMode).toBe(
            'REPORT_ONLY_EXEMPT'
        )
    })

    it('stages the value an eval report calls for and saves it only after the unsafe confirmation', async () => {
        const user = userEvent.setup()
        const evalRow = {
            id: '2',
            appKey: 'maps',
            entrypoint: 'app',
            disposition: 'enforce',
            effectiveDirective: 'script-src',
            blocked: 'eval',
            violationKind: 'EVAL',
            suggestable: false,
            count: 3,
            firstSeen: '2026-11-11T15:01:00.000Z',
            lastSeen: '2026-11-11T15:04:00.000Z',
            status: 'NEW',
        }
        const { findByTestId, getByTestId, findByText, puts } = renderPolicy({
            rows: [evalRow],
        })

        await user.click(await findByTestId('csp-allow-unsafe'))
        const chipValues = () =>
            within(getByTestId('csp-directive-script-src'))
                .queryAllByTestId('csp-source-chip')
                .map((chip) => chip.textContent)
        expect(chipValues()).toEqual(["'unsafe-eval'"])
        expect(await findByText('Staged')).toBeTruthy()

        await user.click(getByTestId('csp-apply'))
        const modal = await findByTestId('csp-unsafe-modal')
        expect(puts).toHaveLength(0)
        await user.click(
            inputIn(within(modal).getByTestId('csp-unsafe-understood'))
        )
        await user.click(within(modal).getByTestId('csp-unsafe-confirm'))

        await waitFor(() => expect(puts).toHaveLength(1))
        expect(puts[0].confirmUnsafe).toBe(true)
        expect(puts[0].entrypoints.app.enforced.add).toEqual({
            'script-src': ["'unsafe-eval'"],
        })
    })

    it('prefills fixes passed in the URL and drops ones that touch locked directives', async () => {
        const fix = (text) => `fix=${encodeURIComponent(text)}`
        const { findByTestId, getByTestId } = renderPolicy({
            rows: [],
            path: `/installed-app/maps?tab=csp&${fix(
                "app script-src 'unsafe-inline'"
            )}&${fix('* frame-ancestors https://evil.example.org')}&${fix(
                '* img-src *'
            )}`,
        })

        await findByTestId('csp-directive-script-src')
        // The row remounts when the editor switches to the fix's entrypoint.
        await waitFor(() =>
            expect(
                within(getByTestId('csp-directive-script-src'))
                    .queryAllByTestId('csp-source-chip')
                    .map((chip) => chip.textContent)
            ).toEqual(["'unsafe-inline'"])
        )
        expect(getByTestId('csp-dirty-state').textContent).toContain(
            'App (index.html)'
        )
        expect(getByTestId('csp-dirty-state').textContent).not.toContain(
            'All entrypoints'
        )
    })

    it('switches a token shipped by core off for one entrypoint and back on', async () => {
        const user = userEvent.setup()
        const { findByTestId, getByTestId, puts } = renderPolicy({
            rows: [],
            detailPatch: {
                baseOverrides: {
                    app: { 'script-src': ["'wasm-unsafe-eval'"] },
                },
                baseUnsafeTokens: ["app script-src 'wasm-unsafe-eval'"],
            },
        })

        const toggle = inputIn(await findByTestId('csp-shipped-switch-app'))
        expect(toggle).toBeChecked()
        await user.click(toggle)
        expect(toggle).not.toBeChecked()
        expect(getByTestId('csp-dirty-state').textContent).toContain(
            'App (index.html)'
        )
        // Switching it back on is no change at all.
        await user.click(toggle)
        expect(toggle).toBeChecked()
        expect(getByTestId('csp-dirty-state').textContent).toBe(
            'No unsaved changes'
        )

        await user.click(toggle)
        await user.click(getByTestId('csp-apply'))
        await waitFor(() => expect(puts).toHaveLength(1))
        expect(puts[0].confirmUnsafe).toBe(false)
        expect(puts[0].entrypoints.app.enforced.disabledBaseSources).toEqual([
            "script-src 'wasm-unsafe-eval'",
        ])
    })
})
