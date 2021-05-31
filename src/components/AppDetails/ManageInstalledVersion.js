import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import { Button } from '@dhis2/ui'
import React from 'react'
import { useApi } from '../../api'
import { getLatestVersion } from '../../get-latest-version'
import { semverGt } from '../../semver-gt'
import styles from './AppDetails.module.css'
import { channelToDisplayName } from './channel-to-display-name'

export const ManageInstalledVersion = ({
    installedApp,
    versions = [],
    onVersionInstall,
    onUninstall,
}) => {
    // Overridden core apps have `bundled` set to true, but unlike preinstalled
    // apps their `version` field has a value
    const isBundled =
        installedApp && installedApp.bundled && !installedApp.version
    const { installVersion, uninstallApp } = useApi()
    const successAlert = useAlert(({ message }) => message, { success: true })
    const errorAlert = useAlert(({ message }) => message, { critical: true })
    const latestVersion = getLatestVersion(versions)
    const handleUpdate = async () => {
        try {
            await installVersion(latestVersion.id)
            successAlert.show({
                message: i18n.t('App updated successfully'),
            })
            onVersionInstall()
        } catch (error) {
            errorAlert.show({
                message: i18n.t('Failed to update app: {{errorMessage}}', {
                    errorMessage: error.message,
                    nsSeparator: null,
                }),
            })
        }
    }
    const handleUninstall = async () => {
        try {
            await uninstallApp(installedApp.key)
            successAlert.show({
                message: i18n.t('App uninstalled successfully'),
            })
            onUninstall()
        } catch (error) {
            errorAlert.show({
                message: i18n.t('Failed to uninstall app: {{errorMessage}}', {
                    errorMessage: error.message,
                    nsSeparator: null,
                }),
            })
        }
    }

    return (
        <div className={styles.manageInstalledVersion}>
            {latestVersion && (
                <>
                    <Button primary onClick={handleUpdate}>
                        {installedApp &&
                        semverGt(latestVersion, installedApp.version)
                            ? i18n.t('Update to latest version')
                            : i18n.t('Install')}
                    </Button>
                    <span className={styles.manageInstalledVersionDescription}>
                        {i18n.t('{{channel}} release {{version}}', {
                            channel:
                                channelToDisplayName[latestVersion.channel],
                            version: latestVersion.version,
                        })}
                    </span>
                </>
            )}
            {installedApp && !isBundled && (
                <Button secondary onClick={handleUninstall}>
                    {i18n.t('Uninstall')}
                </Button>
            )}
        </div>
    )
}

ManageInstalledVersion.propTypes = {
    versions: PropTypes.array.isRequired,
    onVersionInstall: PropTypes.func.isRequired,
    installedApp: PropTypes.object,
    onUninstall: PropTypes.func,
}
