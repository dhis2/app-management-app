import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
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
import { fixKey } from '../../csp/fixes.js'
import styles from './CspPolicy.module.css'

const blockedDetail = (violation) => {
    if (violation.violationKind === 'EXTERNAL' || !violation.sampleSourceFile) {
        return null
    }
    const line = violation.sampleLine ? `:${violation.sampleLine}` : ''
    return `${violation.sampleSourceFile}${line}`
}

const FixAction = ({ violation, fixFor, isStaged, onFix }) => {
    const { fix, reason, allowed } = fixFor(violation)
    if (violation.status === 'ALLOWED_NOW' || allowed) {
        return <Tag positive>{i18n.t('Allowed now')}</Tag>
    }
    if (!fix) {
        return <span className={styles.muted}>{reason}</span>
    }
    if (isStaged(fix)) {
        return <Tag neutral>{i18n.t('Staged')}</Tag>
    }
    return (
        <Button
            small
            onClick={() => onFix(fix)}
            dataTest={fix.unsafe ? 'csp-allow-unsafe' : 'csp-allow-origin'}
        >
            {violation.suggestable
                ? i18n.t('+ Allow origin')
                : i18n.t('+ Allow {{value}}', {
                      interpolation: { escapeValue: false },
                      value: fix.value,
                  })}
        </Button>
    )
}

FixAction.propTypes = {
    fixFor: PropTypes.func.isRequired,
    isStaged: PropTypes.func.isRequired,
    violation: PropTypes.object.isRequired,
    onFix: PropTypes.func.isRequired,
}

export const ViolationsTable = ({
    violations,
    loading,
    error,
    fixFor,
    isStaged,
    onFix,
    onFixAll,
    onClear,
}) => {
    const pending = new Map()
    violations
        .filter(
            (violation) =>
                violation.disposition !== 'report' &&
                violation.status !== 'ALLOWED_NOW'
        )
        .map((violation) => fixFor(violation))
        .filter(({ fix, allowed }) => fix && !allowed && !isStaged(fix))
        .forEach(({ fix }) => pending.set(fixKey(fix), fix))
    const pendingFixes = [...pending.values()]
    return (
        <div data-test="csp-violations">
            <div className={styles.sectionToolbar}>
                <span className={styles.muted}>
                    {loading
                        ? i18n.t('Loading...')
                        : i18n.t('Refreshes every 5 seconds')}
                </span>
                <ButtonStrip>
                    <Button
                        small
                        onClick={() => onFixAll(pendingFixes)}
                        disabled={pendingFixes.length === 0}
                        dataTest="csp-fix-all"
                    >
                        {i18n.t('Stage fixes for all blocked ({{count}})', {
                            count: pendingFixes.length,
                        })}
                    </Button>
                    <Button
                        small
                        secondary
                        onClick={onClear}
                        disabled={violations.length === 0}
                        dataTest="csp-clear-log"
                    >
                        {i18n.t('Clear log')}
                    </Button>
                </ButtonStrip>
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
                                                    ).format(
                                                        'YYYY-MM-DD HH:mm:ss'
                                                    ),
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
                                        <code>
                                            {violation.effectiveDirective}
                                        </code>
                                    </DataTableCell>
                                    <DataTableCell>
                                        <code className={styles.breakAll}>
                                            {violation.blocked}
                                        </code>
                                        {violation.violationKind !==
                                            'EXTERNAL' &&
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
                                    <DataTableCell>
                                        {violation.count}
                                    </DataTableCell>
                                    <DataTableCell>
                                        {violation.disposition === 'report' ? (
                                            <Tag neutral>
                                                {i18n.t('Report-only')}
                                            </Tag>
                                        ) : (
                                            <Tag negative>
                                                {i18n.t('Blocked')}
                                            </Tag>
                                        )}
                                    </DataTableCell>
                                    <DataTableCell>
                                        <FixAction
                                            violation={violation}
                                            fixFor={fixFor}
                                            isStaged={isStaged}
                                            onFix={onFix}
                                        />
                                    </DataTableCell>
                                </DataTableRow>
                            )
                        })}
                    </DataTableBody>
                </DataTable>
            )}
        </div>
    )
}

ViolationsTable.propTypes = {
    fixFor: PropTypes.func.isRequired,
    isStaged: PropTypes.func.isRequired,
    violations: PropTypes.array.isRequired,
    onClear: PropTypes.func.isRequired,
    onFix: PropTypes.func.isRequired,
    onFixAll: PropTypes.func.isRequired,
    error: PropTypes.object,
    loading: PropTypes.bool,
}
