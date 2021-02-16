import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Card,
    Divider,
    NoticeBox,
    CenteredContent,
    CircularLoader,
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
                <p>Some other section</p>
            </div>
        </Card>
    )
}

export default CustomAppDetails
