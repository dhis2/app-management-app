import { useAlert, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import React, { useState, useRef } from 'react'
import styles from './ManualInstall.module.css'

const uploadApp = (baseUrl, file) => {
    const data = new FormData()
    data.append('file', file)
    return fetch(`${baseUrl}/api/apps`, {
        method: 'post',
        body: data,
        credentials: 'include',
    }).then(res => {
        if (status >= 300) {
            throw new Error(res.statusText)
        }
    })
}

const UploadButton = () => {
    const { baseUrl } = useConfig()
    const [isUploading, setIsUploading] = useState(false)
    const successAlert = useAlert(i18n.t('App installed successfully'), {
        success: true,
    })
    const errorAlert = useAlert(
        ({ error }) =>
            i18n.t('Failed to install app: {{errorMessage}}', {
                errorMessage: error.message,
                nsSeparator: '|',
            }),
        { critical: true }
    )
    const formEl = useRef(null)
    const inputEl = useRef(null)
    const handleClick = () => {
        inputEl.current.click()
    }
    const handleUpload = async event => {
        setIsUploading(true)
        try {
            await uploadApp(baseUrl, event.target.files[0])
            formEl.current.reset()
            successAlert.show()
        } catch (error) {
            errorAlert.show({ error })
        }
        setIsUploading(false)
    }

    return (
        <>
            <form className={styles.hiddenForm} ref={formEl}>
                <input
                    type="file"
                    accept="application/zip"
                    ref={inputEl}
                    onChange={handleUpload}
                />
            </form>
            <Button
                className={styles.uploadBtn}
                onClick={handleClick}
                disabled={isUploading}
            >
                {isUploading
                    ? i18n.t('Uploading...')
                    : i18n.t('Upload an app to install')}
            </Button>
        </>
    )
}

const ManualInstall = () => (
    <>
        <h1 className={styles.header}>{i18n.t('Manually install an app')}</h1>
        <p className={styles.warning}>
            {i18n.t(
                'Installed apps have access to your DHIS2 data and metadata. Make sure you trust an app before installing it.'
            )}
        </p>
        <UploadButton />
    </>
)

export default ManualInstall
