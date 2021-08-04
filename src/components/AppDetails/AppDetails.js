import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import { Card, Divider } from '@dhis2/ui'
import moment from 'moment'
import React, { useState } from 'react'
import { getAppIconSrc } from '../../get-app-icon-src'
import { getLatestVersion } from '../../get-latest-version'
import { AppIcon } from '../AppIcon/AppIcon'
import styles from './AppDetails.module.css'
import { ManageInstalledVersion } from './ManageInstalledVersion'
import { Versions } from './Versions'

const Metadata = ({ installedVersion, versions }) => {
    const relativeTime = datetime => moment(datetime).fromNow()
    versions = versions.sort((a, b) => a.created - b.created)
    const latestVersion = getLatestVersion(versions)?.version

    return (
        <ul className={styles.metadataList}>
            <li className={styles.metadataItem}>
                {installedVersion
                    ? i18n.t('Version {{version}} installed', {
                          version: installedVersion,
                      })
                    : i18n.t('Version {{version}}', {
                          version: latestVersion,
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

export const AppDetails = ({
    installedApp,
    appHubApp,
    onVersionInstall,
    onUninstall,
}) => {
    const appName = installedApp ? installedApp.name : appHubApp.name
    const appDeveloper = appHubApp
        ? appHubApp.developer.organisation || appHubApp.developer.name
        : installedApp.developer?.company || installedApp.developer?.name
    const logo = installedApp
        ? getAppIconSrc(installedApp)
        : appHubApp.images.find(i => i.logo)?.imageUrl
    const description = appHubApp
        ? appHubApp.description
        : installedApp.description
    const screenshots = appHubApp?.images
        .filter(i => !i.logo)
        .map(i => i.imageUrl)

    return (
        <Card className={styles.appCard}>
            <header className={styles.header}>
                <div>
                    <AppIcon src={logo} />
                </div>
                <div>
                    <h1 className={styles.headerName}>{appName}</h1>
                    {appDeveloper && (
                        <span className={styles.headerDeveloper}>
                            {i18n.t('by {{- developer}}', {
                                developer: appDeveloper,
                                context: 'developer of application',
                            })}
                        </span>
                    )}
                </div>
            </header>
            <Divider />
            <section className={[styles.section, styles.mainSection].join(' ')}>
                <div>
                    <h2 className={styles.sectionHeader}>
                        {i18n.t('About this app')}
                    </h2>
                    <p>
                        {description || (
                            <em>
                                {i18n.t(
                                    'The developer of this application has not provided a description'
                                )}
                            </em>
                        )}
                    </p>
                </div>
                <div>
                    <ManageInstalledVersion
                        installedApp={installedApp}
                        versions={appHubApp?.versions}
                        onVersionInstall={onVersionInstall}
                        onUninstall={onUninstall}
                    />
                    {installedApp && appHubApp && (
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
                            installedVersion={installedApp?.version}
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
    onUninstall: PropTypes.func,
}
