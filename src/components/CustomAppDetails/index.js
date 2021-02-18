import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import {
    Card,
    Divider,
    NoticeBox,
    CenteredContent,
    CircularLoader,
} from '@dhis2/ui'
import moment from 'moment'
import React, { useState } from 'react'
import semver from 'semver'
import styles from './CustomAppDetails.module.css'
import Versions from './Versions'

const Metadata = ({ installedVersion, versions }) => {
    const relativeTime = datetime => moment(datetime).fromNow()
    versions = versions.sort((a, b) => a.created - b.created)
    const latestVersion = versions.reduce((acc, { version }) => {
        if (semver.gt(semver.coerce(version), acc)) {
            return version
        } else {
            return acc
        }
    }, semver.coerce(versions[0].version))

    return (
        <ul className={styles.metadataList}>
            <li className={styles.metadataItem}>
                {i18n.t('Version {{version}}', {
                    version: installedVersion || latestVersion,
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

const CustomAppDetails = ({ match }) => {
    const query = {
        app: {
            resource: `appHub/v1/apps/${match.params.appHubId}`,
        },
        installedApps: {
            resource: 'apps',
        },
    }
    const { loading, error, data, refetch } = useDataQuery(query)

    if (error) {
        return (
            <NoticeBox error title={i18n.t('Error loading custom app')}>
                {error.message}
            </NoticeBox>
        )
    }

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    const { app, installedApps } = data
    const screenshots = app.images.filter(i => !i.logo).map(i => i.imageUrl)
    const installedVersion = installedApps.find(
        a =>
            a.name === app.name &&
            a.developer &&
            (app.developer.organisation ===
                (a.developer.company || a.developer.name) ||
                app.developer.name === a.developer.name)
    )?.version

    return (
        <Card className={styles.appCard}>
            <header className={styles.header}>
                <h1 className={styles.headerName}>{app.name}</h1>
                <span className={styles.headerDeveloper}>
                    {i18n.t('by {{developer}}', {
                        developer:
                            app.developer.organisation || app.developer.name,
                        context: 'creator of AppHub application',
                    })}
                </span>
            </header>
            <Divider />
            <section className={[styles.section, styles.mainSection].join(' ')}>
                <div>
                    <h2 className={styles.sectionHeader}>
                        {i18n.t('About this app')}
                    </h2>
                    <p>{app.description}</p>
                </div>
                <div>
                    <h2 className={styles.sectionHeader}>
                        {i18n.t('Additional information')}
                    </h2>
                    <Metadata
                        installedVersion={installedVersion}
                        versions={app.versions}
                    />
                </div>
            </section>
            {screenshots.length > 0 ? (
                <>
                    <Divider />
                    <section className={styles.section}>
                        <h2 className={styles.sectionHeader}>
                            {i18n.t('Screenshots')}
                        </h2>
                        <Screenshots screenshots={screenshots} />
                    </section>
                </>
            ) : null}
            <Divider />
            <section className={styles.section}>
                <h2 className={styles.sectionHeader}>
                    {i18n.t('All versions of this application')}
                </h2>
                <Versions
                    installedVersion={installedVersion}
                    versions={app.versions}
                    reloadPage={refetch}
                />
            </section>
        </Card>
    )
}

CustomAppDetails.propTypes = {
    match: PropTypes.object.isRequired,
}

export default CustomAppDetails
