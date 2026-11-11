import i18n from '@dhis2/d2-i18n'
import { Checkbox, IconLock16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { ENTRYPOINT_ALL } from '../../csp/constants.js'
import { isBaseSourceDisabled } from '../../csp/draft.js'
import { parseCspHeader } from '../../csp/header.js'
import styles from './CspPolicy.module.css'

const unique = (values) => [...new Set(values)]

/**
 * Baseline sources (read-only) and core default sources per directive.
 * Unchecking a default source adds it to disabledBaseSources.
 */
export const BaseSources = ({
    detail,
    editable,
    entrypoint,
    lockedDirectives,
    shippedUnsafe = [],
    onToggle,
}) => {
    const baseline = detail.baseline || {}
    const baseOverrides = detail.baseOverrides || {}
    const shared = baseOverrides[ENTRYPOINT_ALL] || {}
    const specific =
        entrypoint === ENTRYPOINT_ALL ? {} : baseOverrides[entrypoint] || {}
    const directives = unique([
        ...Object.keys(baseline),
        ...Object.keys(shared),
        ...Object.keys(specific),
    ]).filter(
        (directive) =>
            !lockedDirectives.includes(directive) && directive !== '...'
    )

    if (directives.length === 0) {
        return <p className={styles.muted}>{i18n.t('No base sources')}</p>
    }

    return (
        <div className={styles.baseSources} data-test="csp-base-sources">
            {directives.map((directive) => {
                const baseValues = baseline[directive] || []
                const defaults = unique([
                    ...(shared[directive] || []),
                    ...(specific[directive] || []),
                ]).filter((source) => !baseValues.includes(source))
                return (
                    <div key={directive} className={styles.directiveRow}>
                        <div className={styles.directiveName}>
                            <code>{directive}</code>
                        </div>
                        <div className={styles.checkboxList}>
                            {baseValues.map((source) => (
                                <Checkbox
                                    key={`baseline-${source}`}
                                    dense
                                    checked
                                    disabled
                                    label={
                                        <span>
                                            <code>{source}</code>{' '}
                                            <span className={styles.muted}>
                                                {i18n.t('baseline')}
                                            </span>
                                        </span>
                                    }
                                />
                            ))}
                            {defaults.map((source) => {
                                const removedForAll =
                                    entrypoint !== ENTRYPOINT_ALL &&
                                    isBaseSourceDisabled(
                                        editable,
                                        ENTRYPOINT_ALL,
                                        {
                                            directive,
                                            source,
                                        }
                                    )
                                const removed = isBaseSourceDisabled(
                                    editable,
                                    entrypoint,
                                    { directive, source }
                                )
                                const shipped = shippedUnsafe.includes(
                                    `${entrypoint} ${directive} ${source}`
                                )
                                return (
                                    <Checkbox
                                        key={`default-${source}`}
                                        dense
                                        checked={!removed && !removedForAll}
                                        disabled={removedForAll}
                                        dataTest="csp-base-source-checkbox"
                                        onChange={({ checked }) =>
                                            onToggle({
                                                directive,
                                                source,
                                                enabled: checked,
                                            })
                                        }
                                        label={
                                            <span>
                                                <code
                                                    className={
                                                        shipped
                                                            ? styles.unsafeText
                                                            : undefined
                                                    }
                                                >
                                                    {source}
                                                </code>{' '}
                                                <span className={styles.muted}>
                                                    {removedForAll
                                                        ? i18n.t(
                                                              'default, removed for all entrypoints'
                                                          )
                                                        : shipped
                                                        ? i18n.t(
                                                              'unsafe, shipped by core'
                                                          )
                                                        : i18n.t('default')}
                                                </span>
                                            </span>
                                        }
                                    />
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

BaseSources.propTypes = {
    detail: PropTypes.object.isRequired,
    editable: PropTypes.object.isRequired,
    entrypoint: PropTypes.string.isRequired,
    lockedDirectives: PropTypes.arrayOf(PropTypes.string).isRequired,
    onToggle: PropTypes.func.isRequired,
    shippedUnsafe: PropTypes.arrayOf(PropTypes.string),
}

/** Mandatory hardening directives as they are in the effective header. */
export const Hardening = ({ detail, effectiveHeader, directives }) => {
    const effective = parseCspHeader(effectiveHeader)
    const rows = directives
        .map((directive) => ({
            directive,
            values: effective[directive] || detail.baseline?.[directive],
        }))
        .filter((row) => row.values)

    return (
        <ul className={styles.hardeningList} data-test="csp-hardening">
            {rows.map(({ directive, values }) => (
                <li key={directive}>
                    <IconLock16 />
                    <code>
                        {directive} {values.join(' ')}
                    </code>
                </li>
            ))}
        </ul>
    )
}

Hardening.propTypes = {
    detail: PropTypes.object.isRequired,
    directives: PropTypes.arrayOf(PropTypes.string).isRequired,
    effectiveHeader: PropTypes.string,
}
