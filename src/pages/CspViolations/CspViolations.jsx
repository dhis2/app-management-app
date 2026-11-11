import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CenteredContent,
    Checkbox,
    CircularLoader,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableRow,
    NoticeBox,
    Tag,
} from '@dhis2/ui'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { CspBadges } from '../../components/CspBadges/CspBadges.jsx'
import {
    CSP_API,
    VIOLATION_POLL_MS,
    entrypointLabel,
} from '../../csp/constants.js'
import { encodeFix, fixForViolation, groupFixes } from '../../csp/fixes.js'
import styles from './CspViolations.module.css'

const query = {
    summary: { resource: `${CSP_API}/apps` },
    reports: { resource: `${CSP_API}/reports` },
}

const lastSeenOf = (rows) =>
    rows.reduce(
        (latest, row) =>
            !latest || row.lastSeen > latest ? row.lastSeen : latest,
        null
    )

/** Apps with CSP violations, worst first, each with the fixes the reports call for. */
export const buildViolationOverview = (
    summary,
    violations,
    { includeReportOnly }
) => {
    const rowsByApp = {}
    violations.forEach((row) => {
        ;(rowsByApp[row.appKey] = rowsByApp[row.appKey] || []).push(row)
    })
    return (summary?.apps || [])
        .map((app) => {
            const rows = rowsByApp[app.appKey] || []
            const blocked = app.violations24h?.enforce || 0
            const reportOnly = app.violations24h?.report || 0
            // Reports from before the last override change may already be fixed.
            const changedAt = app.updatedAt ? Date.parse(app.updatedAt) : null
            const fresh = changedAt
                ? rows.filter((row) => Date.parse(row.lastSeen) > changedAt)
                : rows
            const fixes = groupFixes(fresh, {
                httpsOnly: summary.httpsOnly,
                includeReportOnly: blocked === 0,
            })
            return {
                app,
                rows,
                blocked,
                reportOnly,
                fixes,
                stale: rows.length - fresh.length,
                unfixable: fresh.filter(
                    (row) =>
                        row.disposition !== 'report' &&
                        !fixForViolation(row, { httpsOnly: summary.httpsOnly })
                            .fix
                ).length,
                lastSeen: lastSeenOf(rows),
            }
        })
        .filter((entry) =>
            includeReportOnly
                ? entry.blocked + entry.reportOnly > 0
                : entry.blocked > 0
        )
        .sort(
            (a, b) =>
                b.blocked - a.blocked ||
                b.reportOnly - a.reportOnly ||
                a.app.name.localeCompare(b.app.name)
        )
}

const relaxedApps = (summary) =>
    (summary?.apps || [])
        .filter(
            (app) =>
                app.hasExemptEntrypoint ||
                app.hasUnsafeDirectives ||
                app.baseUnsafeTokens?.length > 0
        )
        .sort((a, b) => a.name.localeCompare(b.name))

const cspPath = (appKey, fixes = []) => {
    const params = new URLSearchParams({ tab: 'csp' })
    fixes.forEach((fix) => params.append('fix', encodeFix(fix)))
    return `/installed-app/${encodeURIComponent(appKey)}?${params.toString()}`
}

export const CspViolations = () => {
    const history = useHistory()
    const [includeReportOnly, setIncludeReportOnly] = useState(false)
    const { loading, error, data, refetch } = useDataQuery(query)
    const refetchRef = useRef(refetch)
    refetchRef.current = refetch
    useEffect(() => {
        const timer = setInterval(() => refetchRef.current(), VIOLATION_POLL_MS)
        return () => clearInterval(timer)
    }, [])

    if (error) {
        return (
            <NoticeBox error title={i18n.t('Could not load CSP violations')}>
                {error.message}
            </NoticeBox>
        )
    }
    if (loading && !data) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    const overview = buildViolationOverview(
        data.summary,
        data.reports?.violations || [],
        { includeReportOnly }
    )
    const relaxed = relaxedApps(data.summary)

    return (
        <div className={styles.page} data-test="csp-violations-page">
            <h1 className={styles.header}>{i18n.t('CSP violations')}</h1>
            <p className={styles.muted}>
                {i18n.t(
                    'Apps whose pages the browser blocked in the last 24 hours, worst first. "Review fix" opens the app with the override the reports call for already staged; unsafe values still need your confirmation on Apply & Save.'
                )}
            </p>
            {data.summary?.reportingEnabled === false && (
                <NoticeBox warning className={styles.notice}>
                    {i18n.t(
                        'CSP violation reporting is disabled on this server, so no new violations will show up.'
                    )}
                </NoticeBox>
            )}
            <Checkbox
                checked={includeReportOnly}
                onChange={({ checked }) => setIncludeReportOnly(checked)}
                label={i18n.t('Also show apps with report-only violations')}
                dataTest="csp-include-report-only"
            />

            {overview.length === 0 ? (
                <p className={styles.empty} data-test="csp-violations-empty">
                    {i18n.t(
                        'No app has blocked CSP violations in the last 24 hours. Open an app to produce reports.'
                    )}
                </p>
            ) : (
                <DataTable className={styles.table}>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableColumnHeader>
                                {i18n.t('App')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                {i18n.t('Blocked')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                {i18n.t('Report-only')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                {i18n.t('Last seen')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                {i18n.t('Fix the reports call for')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader />
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {overview.map((entry) => (
                            <DataTableRow
                                key={entry.app.appKey}
                                dataTest="csp-violations-app"
                            >
                                <DataTableCell>
                                    <div className={styles.appName}>
                                        {entry.app.name}
                                    </div>
                                    <div className={styles.muted}>
                                        {entry.app.appKey}
                                    </div>
                                    <CspBadges summary={entry.app} />
                                </DataTableCell>
                                <DataTableCell>
                                    {entry.blocked > 0 ? (
                                        <Tag negative>{entry.blocked}</Tag>
                                    ) : (
                                        0
                                    )}
                                </DataTableCell>
                                <DataTableCell>
                                    {entry.reportOnly}
                                </DataTableCell>
                                <DataTableCell>
                                    {entry.lastSeen
                                        ? moment(entry.lastSeen).fromNow()
                                        : ''}
                                </DataTableCell>
                                <DataTableCell>
                                    <ul className={styles.fixList}>
                                        {entry.fixes.map((fix) => (
                                            <li
                                                key={encodeFix(fix)}
                                                data-test="csp-violations-fix"
                                            >
                                                <code
                                                    className={
                                                        fix.unsafe
                                                            ? styles.unsafe
                                                            : undefined
                                                    }
                                                >
                                                    {fix.directive} {fix.value}
                                                </code>{' '}
                                                <span className={styles.muted}>
                                                    {i18n.t(
                                                        '{{entrypoint}}, count {{count}}',
                                                        {
                                                            interpolation: {
                                                                escapeValue: false,
                                                            },
                                                            entrypoint:
                                                                entrypointLabel(
                                                                    fix.entrypoint
                                                                ),
                                                            count: fix.count,
                                                        }
                                                    )}
                                                </span>
                                                {fix.unsafe && (
                                                    <Tag negative>
                                                        {i18n.t('unsafe')}
                                                    </Tag>
                                                )}
                                            </li>
                                        ))}
                                        {entry.unfixable > 0 && (
                                            <li className={styles.muted}>
                                                {i18n.t(
                                                    '{{count}} blocked reports have no override fix',
                                                    { count: entry.unfixable }
                                                )}
                                            </li>
                                        )}
                                        {entry.stale > 0 && (
                                            <li
                                                className={styles.muted}
                                                data-test="csp-violations-stale"
                                            >
                                                {i18n.t(
                                                    '{{count}} reports are older than the last policy change ({{changed}}); open the app again to check',
                                                    {
                                                        interpolation: {
                                                            escapeValue: false,
                                                        },
                                                        count: entry.stale,
                                                        changed: moment(
                                                            entry.app.updatedAt
                                                        ).fromNow(),
                                                    }
                                                )}
                                            </li>
                                        )}
                                    </ul>
                                </DataTableCell>
                                <DataTableCell>
                                    <ButtonStrip className={styles.actions}>
                                        <Button
                                            small
                                            primary
                                            disabled={entry.fixes.length === 0}
                                            onClick={() =>
                                                history.push(
                                                    cspPath(
                                                        entry.app.appKey,
                                                        entry.fixes
                                                    )
                                                )
                                            }
                                            dataTest="csp-violations-review-fix"
                                        >
                                            {i18n.t('Review fix')}
                                        </Button>
                                        <Button
                                            small
                                            secondary
                                            onClick={() =>
                                                history.push(
                                                    cspPath(entry.app.appKey)
                                                )
                                            }
                                            dataTest="csp-violations-open"
                                        >
                                            {i18n.t('Open CSP settings')}
                                        </Button>
                                    </ButtonStrip>
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            )}

            {relaxed.length > 0 && (
                <>
                    <h2 className={styles.subheader}>
                        {i18n.t('Apps with a relaxed policy')}
                    </h2>
                    <p className={styles.muted}>
                        {i18n.t(
                            'Unsafe sources or report-only exemptions, set by an admin or shipped by core.'
                        )}
                    </p>
                    <ul className={styles.relaxedList}>
                        {relaxed.map((app) => (
                            <li key={app.appKey} data-test="csp-relaxed-app">
                                <span className={styles.appName}>
                                    {app.name}
                                </span>
                                <CspBadges summary={app} />
                                <Button
                                    small
                                    secondary
                                    onClick={() =>
                                        history.push(cspPath(app.appKey))
                                    }
                                >
                                    {i18n.t('Open CSP settings')}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}
