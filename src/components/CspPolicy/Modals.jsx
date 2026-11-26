import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Checkbox,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
    TextAreaField,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { entrypointLabel } from '../../csp/constants.js'
import { unsafeTokenRisk } from '../../csp/validation.js'
import styles from './CspPolicy.module.css'

const tokenParts = (token) => {
    const [entrypoint, directive, ...rest] = token.split(' ')
    return { entrypoint, directive, value: rest.join(' ') }
}

export const ConfirmUnsafeModal = ({ tokens, busy, onCancel, onConfirm }) => {
    const [understood, setUnderstood] = useState(false)
    return (
        <Modal onClose={onCancel} position="middle" dataTest="csp-unsafe-modal">
            <ModalTitle>{i18n.t('Confirm unsafe CSP sources')}</ModalTitle>
            <ModalContent>
                <NoticeBox error title={i18n.t('This weakens XSS protection')}>
                    {i18n.t(
                        'These sources let injected or third-party code run in the app. Only continue if the app cannot work without them and you trust every allowed source.'
                    )}
                </NoticeBox>
                <ul className={styles.riskList}>
                    {tokens.map((token) => {
                        const { entrypoint, directive, value } =
                            tokenParts(token)
                        return (
                            <li key={token}>
                                <code>
                                    {directive} {value}
                                </code>{' '}
                                <span className={styles.muted}>
                                    ({entrypointLabel(entrypoint)})
                                </span>
                                <div>{unsafeTokenRisk(value)}</div>
                            </li>
                        )
                    })}
                </ul>
                <p>
                    {i18n.t(
                        'The change is audited and the app shows an "Unsafe CSP override" badge in the app list.'
                    )}
                </p>
                <Checkbox
                    checked={understood}
                    onChange={({ checked }) => setUnderstood(checked)}
                    label={i18n.t(
                        'I understand the risk and want to allow these sources'
                    )}
                    dataTest="csp-unsafe-understood"
                />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onCancel} disabled={busy}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        destructive
                        onClick={onConfirm}
                        disabled={!understood || busy}
                        loading={busy}
                        dataTest="csp-unsafe-confirm"
                    >
                        {i18n.t('Save with unsafe sources')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

ConfirmUnsafeModal.propTypes = {
    tokens: PropTypes.arrayOf(PropTypes.string).isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    busy: PropTypes.bool,
}

export const ConfirmExemptModal = ({
    appName,
    entrypoint,
    initialNote,
    busy,
    onCancel,
    onConfirm,
}) => {
    const [note, setNote] = useState(initialNote || '')
    const [understood, setUnderstood] = useState(false)
    const noteMissing = !note.trim()
    return (
        <Modal onClose={onCancel} position="middle" dataTest="csp-exempt-modal">
            <ModalTitle>
                {i18n.t('Exempt {{app}} from CSP enforcement?', {
                    interpolation: { escapeValue: false },
                    app: appName,
                })}
            </ModalTitle>
            <ModalContent>
                <NoticeBox
                    error
                    title={i18n.t(
                        'Last resort, CSP stops protecting {{entrypoint}}',
                        {
                            interpolation: { escapeValue: false },
                            entrypoint: entrypointLabel(entrypoint),
                        }
                    )}
                >
                    {i18n.t(
                        'The browser no longer enforces the policy for this entrypoint; only frame-ancestors stays enforced. The full policy is sent as Content-Security-Policy-Report-Only, so violations still show up here. Use this only when no allowed source makes the app work.'
                    )}
                </NoticeBox>
                <TextAreaField
                    className={styles.modalField}
                    label={i18n.t('Reason (approval note)')}
                    required
                    helpText={i18n.t(
                        'Stored with the override and in the audit log. The server requires it for an exemption.'
                    )}
                    value={note}
                    rows={3}
                    onChange={({ value }) => setNote(value)}
                    dataTest="csp-exempt-note"
                />
                <Checkbox
                    checked={understood}
                    onChange={({ checked }) => setUnderstood(checked)}
                    label={i18n.t(
                        'I understand that CSP no longer blocks attacks on this entrypoint'
                    )}
                    dataTest="csp-exempt-understood"
                />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onCancel} disabled={busy}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        destructive
                        onClick={() => onConfirm(note.trim())}
                        disabled={!understood || noteMissing || busy}
                        loading={busy}
                        dataTest="csp-exempt-confirm"
                    >
                        {i18n.t('Exempt and save')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

ConfirmExemptModal.propTypes = {
    appName: PropTypes.string.isRequired,
    entrypoint: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    busy: PropTypes.bool,
    initialNote: PropTypes.string,
}

export const ConfirmResetModal = ({ appName, busy, onCancel, onConfirm }) => (
    <Modal onClose={onCancel} small dataTest="csp-reset-modal">
        <ModalTitle>
            {i18n.t('Reset {{app}} to the default policy?', {
                interpolation: { escapeValue: false },
                app: appName,
            })}
        </ModalTitle>
        <ModalContent>
            {i18n.t(
                'This removes every admin override for all entrypoints and ends any running draft. The built-in default sources stay.'
            )}
        </ModalContent>
        <ModalActions>
            <ButtonStrip end>
                <Button secondary onClick={onCancel} disabled={busy}>
                    {i18n.t('Cancel')}
                </Button>
                <Button
                    destructive
                    onClick={onConfirm}
                    disabled={busy}
                    loading={busy}
                    dataTest="csp-reset-confirm"
                >
                    {i18n.t('Reset to default')}
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
)

ConfirmResetModal.propTypes = {
    appName: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    busy: PropTypes.bool,
}
