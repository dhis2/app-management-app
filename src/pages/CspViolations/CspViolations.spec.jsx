import { CustomDataProvider, Provider } from '@dhis2/app-runtime'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { CspViolations, buildViolationOverview } from './CspViolations.jsx'

const summary = (appKey, name, { enforce = 0, report = 0, ...extra } = {}) => ({
    appKey,
    name,
    violations24h: { total: enforce + report, enforce, report, distinct: 1 },
    baseUnsafeTokens: [],
    ...extra,
})

const report = (appKey, kind, count) => ({
    id: `${appKey}-${kind}`,
    appKey,
    entrypoint: 'app',
    disposition: 'enforce',
    effectiveDirective: 'script-src',
    violationKind: kind,
    suggestable: false,
    count,
    firstSeen: '2026-11-12T08:00:00.000Z',
    lastSeen: '2026-11-12T08:01:00.000Z',
})

const data = {
    'security/csp/apps': {
        reportingEnabled: true,
        httpsOnly: false,
        apps: [
            summary('dashboard', 'Dashboard'),
            summary('interpretation', 'Interpretations', { enforce: 1 }),
            summary('event-reports', 'Event Reports', { enforce: 5 }),
            summary('reports', 'Reports', { report: 2 }),
            summary('maps', 'Maps', {
                baseUnsafeTokens: ["app script-src 'wasm-unsafe-eval'"],
            }),
        ],
    },
    'security/csp/reports': {
        violations: [
            report('event-reports', 'EVAL', 5),
            report('interpretation', 'INLINE', 1),
        ],
    },
}

const renderPage = () => {
    let location
    const result = render(
        <MemoryRouter initialEntries={['/csp-violations']}>
            <Provider config={{ baseUrl: 'http://dhis2', apiVersion: 43 }}>
                <CustomDataProvider data={data}>
                    <CspViolations />
                    <Route
                        path="*"
                        render={(props) => {
                            location = props.location
                            return null
                        }}
                    />
                </CustomDataProvider>
            </Provider>
        </MemoryRouter>
    )
    return { ...result, getLocation: () => location }
}

describe('CspViolations', () => {
    it('lists apps with blocked violations, worst first, without report-only ones', async () => {
        const { findAllByTestId } = renderPage()
        const rows = await findAllByTestId('csp-violations-app')
        expect(rows.map((r) => r.textContent)).toEqual([
            expect.stringContaining('Event Reports'),
            expect.stringContaining('Interpretations'),
        ])
        expect(
            within(rows[0]).getByText("script-src 'unsafe-eval'")
        ).toBeTruthy()
        expect(
            within(rows[1]).getByText("script-src 'unsafe-inline'")
        ).toBeTruthy()
    })

    it('opens the app CSP tab with the fixes prefilled', async () => {
        const user = userEvent.setup()
        const { findAllByTestId, getLocation } = renderPage()
        const rows = await findAllByTestId('csp-violations-app')
        await user.click(
            within(rows[0]).getByTestId('csp-violations-review-fix')
        )

        const location = getLocation()
        expect(location.pathname).toBe('/installed-app/event-reports')
        const params = new URLSearchParams(location.search)
        expect(params.get('tab')).toBe('csp')
        expect(params.getAll('fix')).toEqual(["app script-src 'unsafe-eval'"])
    })

    it('lists apps with a relaxed policy, including tokens shipped by core', async () => {
        const { findAllByTestId } = renderPage()
        const relaxed = await findAllByTestId('csp-relaxed-app')
        expect(relaxed).toHaveLength(1)
        expect(relaxed[0].textContent).toContain('Unsafe CSP shipped by core')
    })
})

describe('buildViolationOverview', () => {
    it('ignores reports older than the last override change when proposing fixes', () => {
        const [entry] = buildViolationOverview(
            {
                apps: [
                    summary('event-reports', 'Event Reports', {
                        enforce: 5,
                        updatedAt: '2026-11-12T09:00:00.000Z',
                    }),
                ],
            },
            [
                report('event-reports', 'EVAL', 5),
                {
                    ...report('event-reports', 'INLINE', 2),
                    lastSeen: '2026-11-12T09:05:00.000Z',
                },
            ],
            { includeReportOnly: false }
        )
        expect(entry.fixes.map((fix) => fix.value)).toEqual(["'unsafe-inline'"])
        expect(entry.stale).toBe(1)
    })
})
