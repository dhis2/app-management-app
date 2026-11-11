import i18n from '@dhis2/d2-i18n'
import {
    Button,
    InputField,
    NoticeBox,
    SingleSelect,
    SingleSelectOption,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import {
    isUnsafeSource,
    unsafeTokenRisk,
    validateSource,
} from '../../csp/validation.js'
import styles from './CspPolicy.module.css'
import { SourceChip } from './SourceChip.jsx'

const SCRIPT_KEYWORD_OPTIONS = [
    "'self'",
    "'strict-dynamic'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "'wasm-unsafe-eval'",
    "'unsafe-hashes'",
    'blob:',
    'data:',
    'https:',
    '*',
]

const errorFor = (errors, value) =>
    errors.find((error) => error.value === value)?.message

export const DirectiveEditor = ({
    directive,
    values,
    inherited,
    errors,
    httpsOnly,
    disabled,
    pairedWith,
    onAdd,
    onRemove,
}) => {
    const [input, setInput] = useState('')
    const trimmed = input.trim()
    const hint = trimmed
        ? validateSource(directive, trimmed, { httpsOnly })
        : null
    const inputUnsafe = trimmed && !hint && isUnsafeSource(trimmed, directive)
    const isScript = directive === 'script-src'
    const unsafeValues = values.filter((value) =>
        isUnsafeSource(value, directive)
    )
    const rowErrors = errors.filter((error) => !values.includes(error.value))
    let inputValidationText
    if (hint) {
        inputValidationText = hint.message
    } else if (inputUnsafe) {
        inputValidationText = i18n.t('Unsafe, {{risk}}', {
            interpolation: { escapeValue: false },
            risk: unsafeTokenRisk(trimmed),
        })
    }

    const submit = (value) => {
        const source = (value || '').trim()
        if (!source || validateSource(directive, source, { httpsOnly })) {
            return
        }
        onAdd(source)
        setInput('')
    }

    return (
        <div
            className={styles.directiveRow}
            data-test={`csp-directive-${directive}`}
        >
            <div className={styles.directiveName}>
                <code>{directive}</code>
            </div>
            <div>
                <div className={styles.chips}>
                    {inherited.map((value) => (
                        <SourceChip
                            key={`inherited-${value}`}
                            value={value}
                            unsafe={isUnsafeSource(value, directive)}
                            note={i18n.t('from *')}
                        />
                    ))}
                    {values.map((value) => (
                        <SourceChip
                            key={value}
                            value={value}
                            unsafe={isUnsafeSource(value, directive)}
                            error={errorFor(errors, value)}
                            onRemove={
                                disabled ? undefined : () => onRemove(value)
                            }
                        />
                    ))}
                    {inherited.length === 0 && values.length === 0 && (
                        <span className={styles.muted}>
                            {i18n.t('No added sources')}
                        </span>
                    )}
                </div>
                {!disabled && (
                    <div className={styles.addRow}>
                        <InputField
                            dense
                            className={styles.addInput}
                            value={input}
                            placeholder={
                                isScript
                                    ? "https://cdn.example.org or 'unsafe-eval'"
                                    : 'https://tiles.example.org'
                            }
                            onChange={({ value }) => setInput(value)}
                            onKeyDown={(_, event) => {
                                if (event.key === 'Enter') {
                                    submit(input)
                                }
                            }}
                            error={!!hint}
                            warning={!!inputUnsafe}
                            validationText={inputValidationText}
                            dataTest={`csp-add-input-${directive}`}
                        />
                        <Button
                            small
                            onClick={() => submit(input)}
                            disabled={!trimmed || !!hint}
                            dataTest={`csp-add-button-${directive}`}
                        >
                            {i18n.t('Add')}
                        </Button>
                        {isScript && (
                            <SingleSelect
                                dense
                                className={styles.keywordSelect}
                                placeholder={i18n.t('Add keyword or scheme')}
                                selected=""
                                onChange={({ selected }) => submit(selected)}
                                dataTest="csp-script-keyword-select"
                            >
                                {SCRIPT_KEYWORD_OPTIONS.filter(
                                    (option) => !values.includes(option)
                                ).map((option) => (
                                    <SingleSelectOption
                                        key={option}
                                        value={option}
                                        label={
                                            isUnsafeSource(option, directive)
                                                ? i18n.t(
                                                      '{{option}} (unsafe)',
                                                      {
                                                          interpolation: {
                                                              escapeValue: false,
                                                          },
                                                          option,
                                                      }
                                                  )
                                                : option
                                        }
                                    />
                                ))}
                            </SingleSelect>
                        )}
                    </div>
                )}
                {!disabled && pairedWith && (
                    <div className={styles.muted} data-test="csp-paired-note">
                        {i18n.t('Also written to {{entrypoints}}', {
                            interpolation: { escapeValue: false },
                            entrypoints: pairedWith,
                        })}
                    </div>
                )}
                {rowErrors.map((error) => (
                    <div
                        key={`${error.code}|${error.value}|${error.message}`}
                        className={styles.errorText}
                    >
                        {error.value ? `${error.value}: ` : ''}
                        {error.message}
                    </div>
                ))}
                {isScript && unsafeValues.length > 0 && (
                    <NoticeBox
                        error
                        title={i18n.t('Unsafe script sources')}
                        className={styles.rowNotice}
                    >
                        <ul className={styles.riskList}>
                            {unsafeValues.map((value) => (
                                <li key={value}>
                                    <code>{value}</code>:{' '}
                                    {unsafeTokenRisk(value)}
                                </li>
                            ))}
                        </ul>
                        {i18n.t(
                            'Saving needs an explicit confirmation, and the app gets an "Unsafe CSP override" badge.'
                        )}
                    </NoticeBox>
                )}
            </div>
        </div>
    )
}

DirectiveEditor.propTypes = {
    directive: PropTypes.string.isRequired,
    errors: PropTypes.arrayOf(
        PropTypes.shape({
            message: PropTypes.string,
            value: PropTypes.string,
        })
    ).isRequired,
    inherited: PropTypes.arrayOf(PropTypes.string).isRequired,
    values: PropTypes.arrayOf(PropTypes.string).isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    httpsOnly: PropTypes.bool,
    pairedWith: PropTypes.string,
}
