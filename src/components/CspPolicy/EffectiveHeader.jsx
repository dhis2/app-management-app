import i18n from '@dhis2/d2-i18n'
import { Button, Checkbox, TextAreaField } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { entrypointLabel } from '../../csp/constants.js'
import { findMissingSources } from '../../csp/header.js'
import { validateSource } from '../../csp/validation.js'
import styles from './CspPolicy.module.css'

const candidateKey = ({ directive, source }) => `${directive} ${source}`

const HeaderBlock = ({ title, value, dataTest }) => (
    <div className={styles.headerBlock}>
        <div className={styles.headerBlockTitle}>{title}</div>
        <pre className={styles.headerValue} data-test={dataTest}>
            {value}
        </pre>
    </div>
)

HeaderBlock.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    dataTest: PropTypes.string,
}

export const EffectiveHeader = ({
    entrypoint,
    effective,
    preview,
    editableDirectives,
    httpsOnly,
    onStage,
}) => {
    const [pasted, setPasted] = useState('')
    const [result, setResult] = useState(null)
    const [selected, setSelected] = useState([])

    const enforcedHeader = effective?.contentSecurityPolicy || ''

    const parse = () => {
        const found = findMissingSources(
            pasted,
            enforcedHeader,
            editableDirectives
        )
        const candidates = found.candidates.map((candidate) => ({
            ...candidate,
            hint: validateSource(candidate.directive, candidate.source, {
                httpsOnly,
            }),
        }))
        setResult({ ...found, candidates })
        setSelected(
            candidates.filter((candidate) => !candidate.hint).map(candidateKey)
        )
    }

    const stage = () => {
        onStage(
            result.candidates.filter((candidate) =>
                selected.includes(candidateKey(candidate))
            )
        )
        setResult(null)
        setPasted('')
    }

    return (
        <details className={styles.details} data-test="csp-effective-header">
            <summary>{i18n.t('View / paste effective CSP header')}</summary>
            <div className={styles.detailsBody}>
                <p className={styles.muted}>
                    {i18n.t('Composed headers for {{entrypoint}}', {
                        interpolation: { escapeValue: false },
                        entrypoint: entrypointLabel(entrypoint),
                    })}
                </p>
                <HeaderBlock
                    title="Content-Security-Policy"
                    value={enforcedHeader || i18n.t('(none)')}
                    dataTest="csp-header-enforced"
                />
                {effective?.contentSecurityPolicyReportOnly && (
                    <HeaderBlock
                        title="Content-Security-Policy-Report-Only"
                        value={effective.contentSecurityPolicyReportOnly}
                    />
                )}
                {preview?.contentSecurityPolicy &&
                    preview.contentSecurityPolicy !== enforcedHeader && (
                        <HeaderBlock
                            title={i18n.t(
                                'Preview with your unsaved changes (server dry run)'
                            )}
                            value={preview.contentSecurityPolicy}
                            dataTest="csp-header-preview"
                        />
                    )}

                <TextAreaField
                    label={i18n.t('Paste a CSP header')}
                    helpText={i18n.t(
                        'For example the policy an app vendor documents. Sources missing from the current policy can be staged into this entrypoint.'
                    )}
                    value={pasted}
                    rows={3}
                    onChange={({ value }) => setPasted(value)}
                    dataTest="csp-paste-input"
                />
                <Button
                    small
                    onClick={parse}
                    disabled={!pasted.trim()}
                    className={styles.parseButton}
                    dataTest="csp-paste-parse"
                >
                    {i18n.t('Find missing sources')}
                </Button>

                {result && (
                    <div className={styles.pasteResult}>
                        {result.candidates.length === 0 && (
                            <p>
                                {i18n.t(
                                    'The current policy already allows every editable source in the pasted header.'
                                )}
                            </p>
                        )}
                        {result.candidates.map((candidate) => (
                            <Checkbox
                                key={candidateKey(candidate)}
                                dense
                                disabled={!!candidate.hint}
                                checked={selected.includes(
                                    candidateKey(candidate)
                                )}
                                onChange={({ checked }) =>
                                    setSelected((current) =>
                                        checked
                                            ? [
                                                  ...current,
                                                  candidateKey(candidate),
                                              ]
                                            : current.filter(
                                                  (key) =>
                                                      key !==
                                                      candidateKey(candidate)
                                              )
                                    )
                                }
                                label={
                                    <span>
                                        <code>
                                            {candidate.directive}{' '}
                                            {candidate.source}
                                        </code>
                                        {candidate.hint && (
                                            <span className={styles.errorText}>
                                                {' '}
                                                {candidate.hint.message}
                                            </span>
                                        )}
                                    </span>
                                }
                            />
                        ))}
                        {result.ignored.length > 0 && (
                            <p className={styles.muted}>
                                {i18n.t(
                                    'Ignored, not editable per app: {{directives}}',
                                    {
                                        interpolation: { escapeValue: false },
                                        directives: result.ignored.join(', '),
                                        nsSeparator: '-:-',
                                    }
                                )}
                            </p>
                        )}
                        {result.candidates.length > 0 && (
                            <Button
                                small
                                primary
                                onClick={stage}
                                disabled={selected.length === 0}
                                dataTest="csp-paste-stage"
                            >
                                {i18n.t('Stage {{count}} sources', {
                                    interpolation: { escapeValue: false },
                                    count: selected.length,
                                })}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </details>
    )
}

EffectiveHeader.propTypes = {
    editableDirectives: PropTypes.arrayOf(PropTypes.string).isRequired,
    entrypoint: PropTypes.string.isRequired,
    onStage: PropTypes.func.isRequired,
    effective: PropTypes.object,
    httpsOnly: PropTypes.bool,
    preview: PropTypes.object,
}
