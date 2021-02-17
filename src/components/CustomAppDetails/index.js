import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import {
    Card,
    Divider,
    NoticeBox,
    CenteredContent,
    CircularLoader,
    Checkbox,
    SingleSelectField,
    SingleSelectOption,
    Button,
    Table,
    TableHead,
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
} from '@dhis2/ui'
import moment from 'moment'
import React, { useState } from 'react'
import semver from 'semver'
import styles from './CustomAppDetails.module.css'

const Metadata = ({ versions }) => {
    const relativeTime = datetime => moment(datetime).fromNow()
    versions = versions.sort((a, b) => a.created - b.created)
    const latestVersion = versions[versions.length - 1]

    return (
        <ul className={styles.metadataList}>
            <li className={styles.metadataItem}>
                {i18n.t('Version {{version}}', {
                    version: latestVersion.version,
                })}
            </li>
            <li className={styles.metadataItem}>
                {i18n.t('Last updated {{relativeTime}}', {
                    relativeTime: relativeTime(latestVersion.created),
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

const Versions = ({ versions }) => {
    const [channelsFilter, setChannelsFilter] = useState(new Set(['Stable']))
    const [dhisVersionFilter, setVersionFilter] = useState('')
    const { apiVersion } = useConfig()
    const latestDhisVersion = `2.${apiVersion}`
    const dhisVersions = [
        latestDhisVersion,
        `2.${apiVersion - 1}`,
        `2.${apiVersion - 2}`,
    ]
    const dhisVersionFilterSemver = semver.coerce(dhisVersionFilter)
    const satisfiesDhisVersion = version => {
        const { minDhisVersion: min, maxDhisVersion: max } = version
        if (!dhisVersionFilter || (!min && !max)) {
            return true
        } else if (min && max) {
            const range = new semver.Range(`${min} - ${max}`)
            return semver.satisfies(dhisVersionFilterSemver, range)
        } else if (!min && max) {
            const range = new semver.Range(`<=${max}`)
            return semver.satisfies(dhisVersionFilterSemver, range)
        } else if (min && !max) {
            const range = new semver.Range(`>=${min}`)
            return semver.satisfies(dhisVersionFilterSemver, range)
        }
    }
    const filteredVersions = versions
        .filter(version => channelsFilter.has(version.channel))
        .filter(satisfiesDhisVersion)
    const renderVersionRange = (min, max) => {
        if (min && max) {
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
            return i18n.t('All versions')
        }
    }

    // eslint-disable-next-line react/prop-types
    const ChannelCheckbox = ({ name, label }) => {
        const hasChannel = channel => versions.some(v => v.channel === channel)
        const handleChange = ({ checked }) => {
            const newState = new Set(channelsFilter)
            if (checked) {
                newState.add(name)
            } else {
                newState.delete(name)
            }
            setChannelsFilter(newState)
        }

        return hasChannel(name) ? (
            <div className={styles.channelCheckbox}>
                <Checkbox
                    checked={channelsFilter.has(name)}
                    disabled={
                        channelsFilter.size === 1 && channelsFilter.has(name)
                    }
                    onChange={handleChange}
                    label={label}
                />
            </div>
        ) : null
    }

    return (
        <div className={styles.versionsContainer}>
            <div className={styles.versionsFilters}>
                <h3 className={styles.sectionSubheader}>
                    {i18n.t('Channel', { context: 'AppHub release channel' })}
                </h3>
                <ChannelCheckbox
                    name={'Stable'}
                    label={i18n.t('Stable', {
                        context: 'AppHub release channel',
                    })}
                />
                <ChannelCheckbox
                    name={'Development'}
                    label={i18n.t('Development', {
                        context: 'AppHub release channel',
                    })}
                />
                <ChannelCheckbox
                    name={'Canary'}
                    label={i18n.t('Canary', {
                        context: 'AppHub release channel',
                    })}
                />

                <div className={styles.dhisVersionSelect}>
                    <SingleSelectField
                        placeholder={i18n.t('Select a version')}
                        label={i18n.t('Compatible with DHIS2 version')}
                        clearable
                        selected={dhisVersionFilter}
                        onChange={({ selected }) => setVersionFilter(selected)}
                    >
                        {dhisVersions.map(dhisVersion => (
                            <SingleSelectOption
                                key={dhisVersion}
                                label={dhisVersion}
                                value={dhisVersion}
                            />
                        ))}
                    </SingleSelectField>
                </div>
            </div>
            <Table>
                <TableHead>
                    <TableRowHead>
                        <TableCellHead>{i18n.t('Version')}</TableCellHead>
                        <TableCellHead>
                            {i18n.t('Channel', {
                                context: 'AppHub release channel',
                            })}
                        </TableCellHead>
                        <TableCellHead>
                            {i18n.t('DHIS2 version compatibility')}
                        </TableCellHead>
                        <TableCellHead>{i18n.t('Upload date')}</TableCellHead>
                        <TableCellHead></TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody>
                    {filteredVersions.map(version => (
                        <TableRow key={version.id}>
                            <TableCell>{version.version}</TableCell>
                            <TableCell>{version.channel}</TableCell>
                            <TableCell>
                                {renderVersionRange(
                                    version.minDhisVersion,
                                    version.maxDhisVersion
                                )}
                            </TableCell>
                            <TableCell>
                                {moment(version.created).format('L')}
                            </TableCell>
                            <TableCell>
                                <a download href={version.downloadUrl}>
                                    <Button small secondary>
                                        Download
                                    </Button>
                                </a>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

Versions.propTypes = {
    versions: PropTypes.array.isRequired,
}

const CustomAppDetails = ({ match }) => {
    const query = {
        app: {
            resource: `appHub/v1/apps/${match.params.appHubId}`,
        },
    }
    const { loading, error, data } = useDataQuery(query)

    if (error) {
        return (
            <NoticeBox error title={i18n.it('Error loading custom app')}>
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

    const { app } = data
    const screenshots = app.images.filter(i => !i.logo).map(i => i.imageUrl)

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
                    <Metadata versions={app.versions} />
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
                <Versions versions={app.versions} />
            </section>
        </Card>
    )
}

CustomAppDetails.propTypes = {
    match: PropTypes.object.isRequired,
}

export default CustomAppDetails
