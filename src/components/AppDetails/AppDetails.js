import i18n from '@dhis2/d2-i18n'
import { Button, Card, Divider } from '@dhis2/ui'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { getAppIconSrc } from '../../get-app-icon-src.js'
import { getLatestVersion } from '../../get-latest-version.js'
import { AppIcon } from '../AppIcon/AppIcon.js'
import styles from './AppDetails.module.css'
import { Description } from './Description.js'
import { ManageInstalledVersion } from './ManageInstalledVersion.js'
import { Versions } from './Versions.js'
import { useApi } from '../../api.js'
import { useAlert, useConfig } from '@dhis2/app-runtime'
import semver from 'semver'

const Metadata = ({ installedVersion, versions }) => {
    const relativeTime = (datetime) => moment(datetime).fromNow()
    const latestVersion = getLatestVersion(versions)?.version
    const firstPublishedVersion = versions[versions.length - 1]
    const lastPublishedVersion = versions[0]

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
                    relativeTime: relativeTime(lastPublishedVersion.created),
                })}
            </li>
            <li className={styles.metadataItem}>
                {i18n.t('First published {{relativeTime}}', {
                    relativeTime: relativeTime(firstPublishedVersion.created),
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
        : appHubApp.images.find((i) => i.logo)?.imageUrl
    const description = appHubApp
        ? appHubApp.description
        : installedApp.description
    const screenshots = appHubApp?.images
        .filter((i) => !i.logo)
        .map((i) => i.imageUrl)
    const versions = appHubApp?.versions.sort((a, b) => b.created - a.created)

    const { installVersion, uninstallApp } = useApi()

    const installSuccessAlert = useAlert(i18n.t('App installed successfully'), {
        success: true,
    })

    const { serverVersion } = useConfig()

    const dhisVersion = `${serverVersion.major}.${serverVersion.minor}`

    console.log('???', serverVersion, dhisVersion)

    const onInstall = async (version) => {
        await installVersion(version)
        installSuccessAlert.show()
        onVersionInstall()
    }

    useEffect(() => {
        window.onmessage = async (e) => {
            if (e.data?.action === 'install') {
                console.log(e.data)
                // alert(JSON.stringify(e.data))
                await onInstall(e.data?.version?.id)
            }
            // if (e.data == 'hello') {
            //     alert('It works!')
            // }
        }
    })

    // const dhisVersion = '2.41'

    return (
        <Card className={styles.appCard}>
            <header className={styles.header}>
                <div style={{ display: 'flex' }}>
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
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <ManageInstalledVersion
                            installedApp={installedApp}
                            versions={appHubApp?.versions}
                            onVersionInstall={onVersionInstall}
                            onUninstall={onUninstall}
                        />
                        {/* {installedApp && appHubApp && (
                            <div>
                                <h2 className={styles.sectionHeader}>
                                    {i18n.t('Additional information')}
                                </h2>
                                <Metadata
                                    installedVersion={installedApp.version}
                                    versions={versions}
                                />
                            </div>
                        )} */}
                    </div>
                    <div style={{ width: '100%' }}>
                        {installedApp?.launchUrl && (
                            <a
                                href={installedApp.launchUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button
                                    style={{ width: '100%' }}
                                    className={styles.openLink}
                                >
                                    {i18n.t('Open')}
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </header>
            {/* <Divider /> */}
            {/* <section className={[styles.section, styles.mainSection].join(' ')}>
                <div>
                    <h2 className={styles.sectionHeader}>
                        {i18n.t('About this app')}
                    </h2>
                    {description ? (
                        <Description description={description} />
                    ) : (
                        <em>
                            {i18n.t(
                                'The developer of this application has not provided a description'
                            )}
                        </em>
                    )}
                </div>
            </section> */}
            <iframe
                width="100%"
                height="1000px"
                style={{ border: 0 }}
                src={`http://localhost:8080/static/app/${appHubApp.id}?compatibleWith=${dhisVersion}`}
            />
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
                            versions={versions}
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
