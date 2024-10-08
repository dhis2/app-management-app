import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, CircularLoader } from '@dhis2/ui'
import React, { useState, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { useApi } from '../../api.js'
import styles from './ManualInstall.module.css'

const UploadButton = () => {
    const history = useHistory()
    const { uploadApp } = useApi()
    const [isUploading, setIsUploading] = useState(false)
    const successAlert = useAlert(
        i18n.t('App installed successfully'),
        (options) => ({
            success: true,
            actions: options?.id
                ? [
                      {
                          label: i18n.t('View app details'),
                          onClick: () => {
                              history.push(`/app/${options.id}`)
                          },
                      },
                  ]
                : [],
        })
    )
    const errorAlert = useAlert(
        ({ error }) =>
            i18n.t('Failed to install app: {{errorMessage}}', {
                errorMessage: error?.message,
                nsSeparator: '-:-',
            }),
        { critical: true }
    )
    const formEl = useRef(null)
    const inputEl = useRef(null)
    const handleClick = () => {
        inputEl.current.click()
    }
    const handleUpload = async (event) => {
        setIsUploading(true)
        try {
            const response = await uploadApp(event.target.files[0])

            // using response.text() rather .json() to avoid breaking in <v40
            // where the API returned empty response which throws with .json()
            const responseText = await response.text()
            const appHubId = responseText
                ? JSON.parse(responseText)?.app_hub_id
                : null

            formEl.current.reset()

            successAlert.show({ id: appHubId })
        } catch (error) {
            errorAlert.show({ error })
        }
        setIsUploading(false)
    }

    return (
        <>
            <form className={styles.hiddenForm} ref={formEl}>
                <input
                    data-test="file-upload"
                    type="file"
                    accept="application/zip"
                    ref={inputEl}
                    onChange={handleUpload}
                />
            </form>
            <Button
                primary
                className={styles.uploadBtn}
                onClick={handleClick}
                disabled={isUploading}
            >
                {isUploading ? (
                    <>
                        {i18n.t('Uploading...')}
                        <CircularLoader small />
                    </>
                ) : (
                    i18n.t('Upload an app to install')
                )}
            </Button>
        </>
    )
}

export const ManualInstall = () => (
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
