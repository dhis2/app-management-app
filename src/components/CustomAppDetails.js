import { useDataQuery } from '@dhis2/app-runtime'
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
} from '@dhis2/ui'
import React, { useState } from 'react'
import styles from './CustomAppDetails.module.css'

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
    const [channelFilters, setChannelFilters] = useState(new Set(['Stable']))
    const hasChannel = channel => versions.some(v => v.channel == channel)

    const ChannelCheckbox = ({ name, label }) => {
        const handleChange = ({ checked }) => {
            const newState = new Set(channelFilters)
            if (checked) {
                newState.add(name)
            } else {
                newState.delete(name)
            }
            setChannelFilters(newState)
        }

        return hasChannel(name) ? (
            <div className={styles.channelCheckbox}>
                <Checkbox
                    checked={channelFilters.has(name)}
                    disabled={
                        channelFilters.size == 1 && channelFilters.has(name)
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
                        selected="2.35"
                        onChange={() => null}
                    >
                        <SingleSelectOption label="2.35" value="2.35" />
                    </SingleSelectField>
                </div>
            </div>
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
            <div className={styles.section}>
                <h2 className={styles.sectionHeader}>
                    {i18n.t('About this app')}
                </h2>
                <p>{app.description}</p>
            </div>
            {screenshots.length > 0 ? (
                <>
                    <Divider />
                    <div className={styles.section}>
                        <h2 className={styles.sectionHeader}>
                            {i18n.t('Screenshots')}
                        </h2>
                        <Screenshots screenshots={screenshots} />
                    </div>
                </>
            ) : null}
            <Divider />
            <div className={styles.section}>
                <h2 className={styles.sectionHeader}>
                    {i18n.t('All versions of this application')}
                </h2>
                <Versions versions={app.versions} />
            </div>
        </Card>
    )
}

CustomAppDetails.propTypes = {
    match: PropTypes.object.isRequired,
}

export default CustomAppDetails
