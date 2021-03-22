import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import { Button, Card, Divider } from '@dhis2/ui'
import moment from 'moment'
import React, { useState } from 'react'
import { useApi } from '../../api'
import { getLatestVersion } from '../../get-latest-version'
import { semverGt } from '../../semver-gt'
import styles from './AppDetails.module.css'
import { channelToDisplayName } from './channel-to-display-name'
import { Versions } from './Versions'

const ManageInstalledVersion = ({ installedApp, versions, reloadPage }) => {
    const { installVersion, uninstallApp } = useApi()
    const successAlert = useAlert(({ message }) => message, { success: true })
    const errorAlert = useAlert(({ message }) => message, { critical: true })
    const latestVersion = getLatestVersion(versions)
    const handleUpdate = async () => {
        try {
            await installVersion(latestVersion.id)
            successAlert.show({
                message: i18n.t('App uninstalled successfully'),
            })
            reloadPage()
        } catch (error) {
            errorAlert.show({
                message: i18n.t('Failed to uninstall app: {{errorMessage}}', {
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
            reloadPage()
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
            {latestVersion && semverGt(latestVersion, installedApp.version) && (
                <>
                    <Button primary onClick={handleUpdate}>
                        {i18n.t('Update to latest version')}
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
            {!installedApp.bundled && (
                <Button secondary onClick={handleUninstall}>
                    {i18n.t('Uninstall')}
                </Button>
            )}
        </div>
    )
}

ManageInstalledVersion.propTypes = {
    reloadPage: PropTypes.func.isRequired,
    versions: PropTypes.array.isRequired,
    installedApp: PropTypes.object,
}

const Metadata = ({ installedVersion, versions }) => {
    const relativeTime = datetime => moment(datetime).fromNow()
    versions = versions.sort((a, b) => a.created - b.created)
    const latestVersion = getLatestVersion(versions)

    return (
        <ul className={styles.metadataList}>
            <li className={styles.metadataItem}>
                {installedVersion
                    ? i18n.t('Version {{version}} installed', {
                          version: installedVersion,
                      })
                    : i18n.t('Version {{version}}', {
                          version: latestVersion.version,
                      })}
            </li>
            <li className={styles.metadataItem}>
                {i18n.t('Last updated {{relativeTime}}', {
                    relativeTime: relativeTime(
                        versions[versions.length - 1].created
                    ),
                })}
            </li>
            <li className={styles.metadataItem}>
                {i18n.t('First published {{relativeTime}}', {
                    relativeTime: relativeTime(versions[0].created),
                })}
            </li>
        </ul>
    )
}

Metadata.propTypes = {
    versions: PropTypes.array.isRequired,
    installedVersion: PropTypes.string,
}

const Screenshots = ({ screenshots }) => {
    const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0)
    const currentScreenshot = screenshots[currentScreenshotIndex]

    return (
        <div className={styles.screenshots}>
            <div>
                <img
                    className={styles.currentScreenshot}
                    src={currentScreenshot}
                />
            </div>
            <div>
                {screenshots.map((screenshot, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentScreenshotIndex(index)}
                        className={
                            styles.otherScreenshot +
                            ' ' +
                            (index === currentScreenshotIndex
                                ? styles.otherScreenshotCurrent
                                : '')
                        }
                    >
                        <img src={screenshot} />
                    </button>
                ))}
            </div>
        </div>
    )
}

Screenshots.propTypes = {
    screenshots: PropTypes.array.isRequired,
}

export const AppDetails = ({ installedApp, appHubApp, onVersionInstall }) => {
    const appName = installedApp ? installedApp.name : appHubApp.name
    const appDeveloper = appHubApp
        ? appHubApp.developer.organisation || appHubApp.developer.name
        : installedApp.developer?.company || installedApp.developer?.name
    const screenshots = appHubApp?.images
        .filter(i => !i.logo)
        .map(i => i.imageUrl)

    return (
        <Card className={styles.appCard}>
            <header className={styles.header}>
                <h1 className={styles.headerName}>{appName}</h1>
                {appDeveloper && (
                    <span className={styles.headerDeveloper}>
                        {i18n.t('by {{developer}}', {
                            developer: appDeveloper,
                            context: 'developer of application',
                        })}
                    </span>
                )}
            </header>
            <Divider />
            <section className={[styles.section, styles.mainSection].join(' ')}>
                {appHubApp && (
                    <div>
                        <h2 className={styles.sectionHeader}>
                            {i18n.t('About this app')}
                        </h2>
                        <p>
                            {appHubApp.description || (
                                <em>
                                    {i18n.t(
                                        'The developer of this application has not provided a description'
                                    )}
                                </em>
                            )}
                        </p>
                    </div>
                )}
                <div>
                    {installedApp && (
                        <ManageInstalledVersion
                            installedApp={installedApp}
                            versions={appHubApp?.versions || []}
                            reloadPage={onVersionInstall}
                        />
                    )}
                    {appHubApp && (
                        <div>
                            <h2 className={styles.sectionHeader}>
                                {i18n.t('Additional information')}
                            </h2>
                            <Metadata
                                installedVersion={installedApp.version}
                                versions={appHubApp.versions}
                            />
                        </div>
                    )}
                </div>
            </section>
            {screenshots?.length > 0 && (
                <>
                    <Divider />
                    <section className={styles.section}>
                        <h2 className={styles.sectionHeader}>
                            {i18n.t('Screenshots')}
                        </h2>
                        <Screenshots screenshots={screenshots} />
                    </section>
                </>
            )}
            {appHubApp && (
                <>
                    <Divider />
                    <section className={styles.section}>
                        <h2 className={styles.sectionHeader}>
                            {i18n.t(
                                'All compatible versions of this application'
                            )}
                        </h2>
                        <Versions
                            installedVersion={installedApp.version}
                            versions={appHubApp.versions}
                            onVersionInstall={onVersionInstall}
                        />
                    </section>
                </>
            )}
        </Card>
    )
}

AppDetails.propTypes = {
    onVersionInstall: PropTypes.func.isRequired,
    appHubApp: PropTypes.object,
    installedApp: PropTypes.object,
}
