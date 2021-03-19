import { useAlert, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import {
    Button,
    Card,
    Divider,
    NoticeBox,
    CenteredContent,
    CircularLoader,
} from '@dhis2/ui'
import moment from 'moment'
import React, { useState } from 'react'
import { useApi } from '../../api'
import { coreApps } from '../../core-apps'
import getLatestVersion from '../../get-latest-version'
import { channelToDisplayName } from '../CustomAppDetails/channel-to-display-name'
import styles from '../CustomAppDetails/CustomAppDetails.module.css'
import Versions from '../CustomAppDetails/Versions'

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
    const renderVersionRange = ({
        minDhisVersion: min,
        maxDhisVersion: max,
    }) => {
        if (min && max) {
            if (min === max) {
                return `${min}`
            }
            return `${min}–${max}`
        } else if (min && !max) {
            return i18n.t('{{minDhisVersion}} and above', {
                minDhisVersion: min,
            })
        } else if (!min && max) {
            return i18n.t('{{maxDhisVersion}} and below', {
                maxDhisVersion: max,
            })
        } else {
            return i18n.t('all versions')
        }
    }

    return (
        <div className={styles.manageInstalledVersion}>
            {latestVersion && installedApp.version !== latestVersion && (
                <>
                    <Button primary onClick={handleUpdate}>
                        {i18n.t('Update to latest version')}
                    </Button>
                    <span className={styles.manageInstalledVersionDescription}>
                        {i18n.t(
                            '{{channel}} release {{version}}. Compatible with DHIS2 {{versionRange}}',
                            {
                                channel:
                                    channelToDisplayName[latestVersion.channel],
                                version: latestVersion.version,
                                versionRange: renderVersionRange(latestVersion),
                            }
                        )}
                    </span>
                </>
            )}
            <Button secondary onClick={handleUninstall}>
                {i18n.t('Uninstall')}
            </Button>
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
                {i18n.t('Version {{version}}', {
                    version: installedVersion || latestVersion.version,
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

const appsQuery = {
    modules: {
        resource: 'action::menu/getModules',
    },
    installedApps: {
        resource: 'apps',
    },
}

const appHubQuery = {
    app: {
        resource: `appHub/v1/apps`,
        id: ({ appHubId }) => appHubId,
    },
}

export const AppDetails = ({ match }) => {
    const { appKey } = match.params
    const appsResponse = useDataQuery(appsQuery)
    const appHubResponse = useDataQuery(appHubQuery, { lazy: true })

    if (appsResponse.error || appHubResponse.error) {
        return (
            <NoticeBox error title={i18n.t('Error loading app')}>
                {(appsResponse.error || appHubResponse.error).message}
            </NoticeBox>
        )
    }

    if (appsResponse.loading || appHubResponse.loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    const {
        modules: { modules },
        installedApps,
    } = appsResponse.data
    const coreApp = coreApps.find(app => app.key === appKey)
    const app = installedApps.find(app => app.key === appKey) || coreApp
    if (!app) {
        return (
            <NoticeBox error title={i18n.t('Error loading app')}>
                {i18n.t('App not found')}
            </NoticeBox>
        )
    }

    // XXX
    if (app.bundled && !app.app_hub_id && app.name === 'App Management') {
        app.app_hub_id = '28823170-1203-46d1-81d5-eea67abae41c'
    }

    const module = modules.find(app => app.name === `dhis-web-${appKey}`)
    // If the app is a core app, then `module.displayName` should contain its translated name
    if (coreApp && module) {
        app.name = module.displayName
    }

    if (app.app_hub_id && !appHubResponse.called) {
        appHubResponse.refetch({ appHubId: app.app_hub_id })
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }
    const appHubApp = appHubResponse.data?.app
    const screenshots = appHubApp?.images
        .filter(i => !i.logo)
        .map(i => i.imageUrl)

    return (
        <Card className={styles.appCard}>
            <header className={styles.header}>
                <h1 className={styles.headerName}>{app.name}</h1>
                <span className={styles.headerDeveloper}>
                    {i18n.t('by {{developer}}', {
                        developer: app.developer.company || app.developer.name,
                        context: 'developer of application',
                    })}
                </span>
            </header>
            <Divider />
            <section className={[styles.section, styles.mainSection].join(' ')}>
                {appHubApp && (
                    <div>
                        <h2 className={styles.sectionHeader}>
                            {i18n.t('About this app')}
                        </h2>
                        <p>{appHubApp.description}</p>
                    </div>
                )}
                <div>
                    <ManageInstalledVersion
                        installedApp={app}
                        versions={appHubApp?.versions || []}
                        reloadPage={appsResponse.refetch}
                    />
                    {appHubApp && (
                        <div>
                            <h2 className={styles.sectionHeader}>
                                {i18n.t('Additional information')}
                            </h2>
                            <Metadata
                                installedVersion={app.version}
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
                            {i18n.t('All versions of this application')}
                        </h2>
                        <Versions
                            installedVersion={app.version}
                            versions={appHubApp.versions}
                            reloadPage={appsResponse.refetch}
                        />
                    </section>
                </>
            )}
        </Card>
    )
}

AppDetails.propTypes = {
    match: PropTypes.object.isRequired,
}
