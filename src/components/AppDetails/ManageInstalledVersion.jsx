import { useAlert, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import semver from 'semver'
import { useApi } from '../../api.js'
import { getLatestVersion } from '../../get-latest-version.js'
import { getCompatibleVersions, semverGt } from '../../semver-helpers.js'
import styles from './AppDetails.module.css'
import { channelToDisplayName } from './channel-to-display-name.js'

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
    const latestVersion = getLatestVersion(versions)
    const canInstall =
        latestVersion && latestVersion.version !== installedApp?.version

    const { serverVersion } = useConfig()

    const dhisVersion = semver.coerce(
        `${serverVersion.major}.${serverVersion.minor}`
    )

    const compatibleVersions = getCompatibleVersions(versions, dhisVersion)
    const hasCompatibleVersions = compatibleVersions.length > 0

    const canUninstall = installedApp && !isBundled
    const canUpdate =
        installedApp &&
        latestVersion &&
        semverGt(latestVersion.version, installedApp.version)
    const { installVersion, uninstallApp } = useApi()
    const successAlert = useAlert(({ message }) => message, { success: true })
    const errorAlert = useAlert(({ message }) => message, { critical: true })

    const [isInstalling, setIsInstalling] = useState(false)

    const handleInstall = async () => {
        try {
            setIsInstalling(true)
            await installVersion(latestVersion.id)
            successAlert.show({
                message: canUpdate
                    ? i18n.t('App updated successfully')
                    : i18n.t('App installed successfully'),
            })
            onVersionInstall()
        } catch (error) {
            errorAlert.show({
                message: canUpdate
                    ? i18n.t('Failed to update app: {{errorMessage}}', {
                          errorMessage: error.message,
                          nsSeparator: '-:-',
                      })
                    : i18n.t('Failed to install app: {{errorMessage}}', {
                          errorMessage: error.message,
                          nsSeparator: '-:-',
                      }),
            })
        } finally {
            setIsInstalling(false)
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
                    nsSeparator: '-:-',
                }),
            })
        }
    }

    const installButtonText = isInstalling
        ? i18n.t('Installing...')
        : canUpdate
        ? i18n.t('Update to latest version')
        : i18n.t('Install')

    return (
        <div className={styles.manageInstalledVersion}>
            {!hasCompatibleVersions && (
                <div>
                    <em>
                        {i18n.t('There are no compatible versions available.')}
                    </em>
                </div>
            )}
            {hasCompatibleVersions && canInstall && (
                <>
                    <Button
                        primary
                        onClick={handleInstall}
                        disabled={isInstalling}
                        icon={isInstalling ? <CircularLoader small /> : null}
                    >
                        {installButtonText}
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
            {canUninstall && (
                <Button secondary destructive onClick={handleUninstall}>
                    {i18n.t('Uninstall v{{appVersion}}', {
                        appVersion: installedApp.version,
                    })}
                </Button>
            )}
        </div>
    )
}

ManageInstalledVersion.propTypes = {
    onVersionInstall: PropTypes.func.isRequired,
    installedApp: PropTypes.object,
    versions: PropTypes.array,
    onUninstall: PropTypes.func,
}
