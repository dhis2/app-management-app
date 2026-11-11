import i18n from '@dhis2/d2-i18n'
import {
    Button,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableRow,
    Tag,
} from '@dhis2/ui'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { entrypointLabel } from '../../csp/constants.js'
import styles from './CspPolicy.module.css'

const blockedDetail = (violation) => {
    if (violation.violationKind === 'EXTERNAL' || !violation.sampleSourceFile) {
        return null
    }
    const line = violation.sampleLine ? `:${violation.sampleLine}` : ''
    return `${violation.sampleSourceFile}${line}`
}

export const ViolationsTable = ({
    violations,
    loading,
    error,
    isStaged,
    onAllow,
    onClear,
}) => (
    <div data-test="csp-violations">
        <div className={styles.sectionToolbar}>
            <span className={styles.muted}>
                {loading
                    ? i18n.t('Loading...')
                    : i18n.t('Refreshes every 5 seconds')}
            </span>
            <Button
                small
                secondary
                onClick={onClear}
                disabled={violations.length === 0}
                dataTest="csp-clear-log"
            >
                {i18n.t('Clear log')}
            </Button>
        </div>
        {error && (
            <p className={styles.errorText}>
                {i18n.t('Could not load violation reports: {{message}}', {
                    interpolation: { escapeValue: false },
                    message: error.message,
                    nsSeparator: '-:-',
                })}
            </p>
        )}
        {violations.length === 0 ? (
            <p className={styles.muted}>
                {i18n.t('No CSP violations reported in the last 24 hours')}
            </p>
        ) : (
            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>
                            {i18n.t('Last seen')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader>
                            {i18n.t('Entrypoint')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader>
                            {i18n.t('Directive')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader>
                            {i18n.t('Blocked')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader>
                            {i18n.t('Count')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader>
                            {i18n.t('Disposition')}
                        </DataTableColumnHeader>
                        <DataTableColumnHeader />
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {violations.map((violation) => {
                        const detail = blockedDetail(violation)
                        const staged = isStaged(violation)
                        return (
                            <DataTableRow
                                key={violation.id}
                                dataTest="csp-violation-row"
                            >
                                <DataTableCell>
                                    <span
                                        title={i18n.t(
                                            'First seen {{firstSeen}}',
                                            {
                                                interpolation: {
                                                    escapeValue: false,
                                                },
                                                firstSeen: moment(
                                                    violation.firstSeen
                                                ).format('YYYY-MM-DD HH:mm:ss'),
                                            }
                                        )}
                                    >
                                        {moment(violation.lastSeen).format(
                                            'HH:mm:ss'
                                        )}
                                    </span>
                                </DataTableCell>
                                <DataTableCell>
                                    {entrypointLabel(violation.entrypoint)}
                                </DataTableCell>
                                <DataTableCell>
                                    <code>{violation.effectiveDirective}</code>
                                </DataTableCell>
                                <DataTableCell>
                                    <code className={styles.breakAll}>
                                        {violation.blocked}
                                    </code>
                                    {violation.violationKind !== 'EXTERNAL' &&
                                        violation.violationKind?.toLowerCase() !==
                                            violation.blocked?.toLowerCase() && (
                                            <span className={styles.muted}>
                                                {' '}
                                                {violation.violationKind?.toLowerCase()}
                                            </span>
                                        )}
                                    {detail && (
                                        <div
                                            className={`${styles.muted} ${styles.breakAll}`}
                                        >
                                            {detail}
                                        </div>
                                    )}
                                </DataTableCell>
                                <DataTableCell>{violation.count}</DataTableCell>
                                <DataTableCell>
                                    {violation.disposition === 'report' ? (
                                        <Tag neutral>
                                            {i18n.t('Report-only')}
                                        </Tag>
                                    ) : (
                                        <Tag negative>{i18n.t('Blocked')}</Tag>
                                    )}
                                </DataTableCell>
                                <DataTableCell>
                                    {violation.status === 'ALLOWED_NOW' ? (
                                        <Tag positive>
                                            {i18n.t('Allowed now')}
                                        </Tag>
                                    ) : staged ? (
                                        <Tag neutral>{i18n.t('Staged')}</Tag>
                                    ) : violation.suggestable ? (
                                        <Button
                                            small
                                            onClick={() => onAllow(violation)}
                                            dataTest="csp-allow-origin"
                                        >
                                            {i18n.t('+ Allow origin')}
                                        </Button>
                                    ) : null}
                                </DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </DataTableBody>
            </DataTable>
        )}
    </div>
)

ViolationsTable.propTypes = {
    isStaged: PropTypes.func.isRequired,
    violations: PropTypes.array.isRequired,
    onAllow: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    error: PropTypes.object,
    loading: PropTypes.bool,
}
