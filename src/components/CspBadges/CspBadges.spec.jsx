import { render } from '@testing-library/react'
import React from 'react'
import { CspBadges } from './CspBadges.jsx'

describe('CspBadges', () => {
    it('renders nothing for an app without CSP findings', () => {
        const { container } = render(
            <CspBadges
                summary={{
                    hasOverride: true,
                    violations24h: { total: 0, enforce: 0, report: 0 },
                }}
            />
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('shows exempt, unsafe and violation badges', () => {
        const { getByTestId } = render(
            <CspBadges
                summary={{
                    hasExemptEntrypoint: true,
                    hasUnsafeDirectives: true,
                    unsafeTokens: ["* script-src 'unsafe-eval'"],
                    violations24h: { total: 3, enforce: 3, report: 0 },
                }}
            />
        )
        expect(getByTestId('csp-badge-exempt').textContent).toBe(
            'CSP Exempt (Report-Only)'
        )
        expect(getByTestId('csp-badge-unsafe').textContent).toBe(
            'Unsafe CSP override'
        )
        expect(getByTestId('csp-badge-violations').textContent).toBe(
            '3 CSP violations'
        )
    })

    it('uses the singular for one violation', () => {
        const { getByTestId } = render(
            <CspBadges
                summary={{ violations24h: { total: 1, enforce: 0, report: 1 } }}
            />
        )
        expect(getByTestId('csp-badge-violations').textContent).toBe(
            '1 CSP violation'
        )
    })
})
