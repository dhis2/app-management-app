import i18n from '@dhis2/d2-i18n'
import { IconCross16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './CspPolicy.module.css'

export const SourceChip = ({ value, unsafe, error, note, onRemove }) => {
    const classes = [styles.sourceChip]
    if (unsafe) {
        classes.push(styles.sourceChipUnsafe)
    }
    if (error) {
        classes.push(styles.sourceChipError)
    }
    if (!onRemove) {
        classes.push(styles.sourceChipReadOnly)
    }
    return (
        <span
            className={classes.join(' ')}
            title={error || (unsafe ? i18n.t('Unsafe source') : undefined)}
            data-test="csp-source-chip"
        >
            <code>{value}</code>
            {note && <span className={styles.sourceChipNote}>{note}</span>}
            {onRemove && (
                <button
                    type="button"
                    className={styles.sourceChipRemove}
                    onClick={onRemove}
                    aria-label={i18n.t('Remove {{value}}', {
                        interpolation: { escapeValue: false },
                        value,
                    })}
                >
                    <IconCross16 />
                </button>
            )}
        </span>
    )
}

SourceChip.propTypes = {
    value: PropTypes.string.isRequired,
    error: PropTypes.string,
    note: PropTypes.string,
    unsafe: PropTypes.bool,
    onRemove: PropTypes.func,
}
