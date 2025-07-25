import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Card,
    Divider,
    IconTerminalWindow16,
    IconUser16,
    Tab,
    TabBar,
} from '@dhis2/ui'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { getAppIconSrc } from '../../get-app-icon-src.js'
import { getLatestVersion } from '../../get-latest-version.js'
import { AppIcon } from '../AppIcon/AppIcon.jsx'
import styles from './AppDetails.module.css'
import { appTypeToDisplayName } from './appDisplayConfig.js'
import { Description } from './Description.jsx'
import { LatestUpdates } from './LatestUpdates.jsx'
import { ManageInstalledVersion } from './ManageInstalledVersion.jsx'
import PluginTag from './PluginTag.jsx'
import { Versions } from './Versions.jsx'

const Metadata = ({ installedVersion, versions }) => {
    const relativeTime = (datetime) => moment(datetime).fromNow()
    const latestVersion = getLatestVersion(versions)?.version
    const firstPublishedVersion = versions[versions.length - 1]
    const stableVersions = versions.filter((v) => v.channel === 'stable')
    const lastPublishedVersion = stableVersions[0]

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
    changelog,
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
    const stableVersions = appHubApp?.versions.filter(
        (v) => v.channel === 'stable'
    )

    const history = useHistory()

    const location = useLocation()

    const selectedTab =
        new URLSearchParams(location.search).get('tab') ?? 'about'

    const selectTab = (tabName) => () => {
        history.push('?tab=' + tabName)
    }

    const hasChangelog = !!changelog && Object.keys(changelog)?.length > 0

    return (
        <Card className={styles.appCard}>
            <header className={styles.header}>
                <div>
                    <AppIcon src={logo} />
                </div>
                <div>
                    <h1 className={styles.headerName}>{appName}</h1>
                    <div className={styles.appTags}>
                        {appDeveloper && (
                            <div className={styles.tagWithIcon}>
                                <IconUser16 />

                                {appDeveloper}
                            </div>
                        )}
                        <div
                            data-test="app-type"
                            className={styles.tagWithIcon}
                        >
                            <IconTerminalWindow16 />
                            {appTypeToDisplayName[appHubApp?.appType] ??
                                appHubApp?.appType}
                        </div>
                        {appHubApp?.hasPlugin && (
                            <PluginTag
                                hasPlugin={appHubApp.hasPlugin}
                                pluginType={appHubApp.pluginType}
                            />
                        )}
                    </div>
                </div>
                <div>
                    {installedApp?.launchUrl && (
                        <a
                            href={installedApp.launchUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button className={styles.openLink}>
                                {i18n.t('Open')}
                            </Button>
                        </a>
                    )}
                </div>
            </header>
            <Divider />
            <TabBar dataTest="tabbar-appview">
                <Tab
                    onClick={selectTab('about')}
                    selected={selectedTab == 'about'}
                >
                    About
                </Tab>
                <Tab
                    onClick={selectTab('previous-releases')}
                    selected={selectedTab == 'previous-releases'}
                >
                    Previous releases
                </Tab>
            </TabBar>

            {selectedTab == 'about' && (
                <>
                    <section
                        className={[styles.section, styles.mainSection].join(
                            ' '
                        )}
                    >
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
                            {hasChangelog && (
                                <LatestUpdates
                                    installedVersion={installedApp?.version}
                                    versions={stableVersions}
                                    changelog={changelog}
                                />
                            )}
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
                                        versions={versions}
                                    />
                                </div>
                            )}
                        </div>
                        {screenshots?.length > 0 && (
                            <div>
                                <Divider />
                                <section className={styles.section}>
                                    <h2 className={styles.sectionHeader}>
                                        {i18n.t('Screenshots')}
                                    </h2>
                                    <Screenshots screenshots={screenshots} />
                                </section>
                            </div>
                        )}
                    </section>
                </>
            )}

            {appHubApp && selectedTab === 'previous-releases' && (
                <>
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
                            changelog={changelog}
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
    changelog: PropTypes.object,
    installedApp: PropTypes.object,
    onUninstall: PropTypes.func,
}
