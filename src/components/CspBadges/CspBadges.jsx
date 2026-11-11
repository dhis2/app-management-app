import i18n from '@dhis2/d2-i18n'
import { Tag, Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './CspBadges.module.css'

/**
 * CSP status badges for one app. `summary` is an entry of
 * GET /api/security/csp/apps (or the same flags from the detail view).
 */
export const CspBadges = ({ summary, showOverride }) => {
    if (!summary) {
        return null
    }
    const violations = summary.violations24h?.total || 0
    const blocked = summary.violations24h?.enforce || 0
    const badges = []

    if (summary.hasExemptEntrypoint) {
        badges.push(
            <Tooltip
                key="exempt"
                content={i18n.t(
                    'At least one entrypoint of this app is exempt from CSP enforcement and only reports violations'
                )}
            >
                <Tag negative bold dataTest="csp-badge-exempt">
                    {i18n.t('CSP Exempt (Report-Only)')}
                </Tag>
            </Tooltip>
        )
    }
    if (summary.hasUnsafeDirectives) {
        badges.push(
            <Tooltip
                key="unsafe"
                content={(summary.unsafeTokens || []).join(', ')}
            >
                <Tag negative dataTest="csp-badge-unsafe">
                    {i18n.t('Unsafe CSP override')}
                </Tag>
            </Tooltip>
        )
    }
    if (violations > 0) {
        badges.push(
            <Tooltip
                key="violations"
                content={i18n.t(
                    '{{blocked}} blocked, {{reported}} report-only in the last 24 hours',
                    {
                        interpolation: { escapeValue: false },
                        blocked,
                        reported: summary.violations24h?.report || 0,
                    }
                )}
            >
                <Tag
                    neutral={blocked === 0}
                    negative={blocked > 0}
                    dataTest="csp-badge-violations"
                >
                    {violations === 1
                        ? i18n.t('1 CSP violation')
                        : i18n.t('{{count}} CSP violations', {
                              interpolation: { escapeValue: false },
                              count: violations,
                          })}
                </Tag>
            </Tooltip>
        )
    }
    if (summary.hasActiveDraft) {
        badges.push(
            <Tag key="draft" neutral dataTest="csp-badge-draft">
                {i18n.t('CSP draft running')}
            </Tag>
        )
    }
    if (showOverride && summary.hasOverride) {
        badges.push(
            <Tag key="override" positive dataTest="csp-badge-override">
                {i18n.t('CSP override')}
            </Tag>
        )
    }

    if (badges.length === 0) {
        return null
    }
    return (
        <div className={styles.badges} data-test="csp-badges">
            {badges}
        </div>
    )
}

CspBadges.propTypes = {
    showOverride: PropTypes.bool,
    summary: PropTypes.shape({
        hasActiveDraft: PropTypes.bool,
        hasExemptEntrypoint: PropTypes.bool,
        hasOverride: PropTypes.bool,
        hasUnsafeDirectives: PropTypes.bool,
        unsafeTokens: PropTypes.arrayOf(PropTypes.string),
        violations24h: PropTypes.shape({
            enforce: PropTypes.number,
            report: PropTypes.number,
            total: PropTypes.number,
        }),
    }),
}
