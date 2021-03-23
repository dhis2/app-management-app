import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { AppIcon } from '../../components/AppIcon/AppIcon'
import { getLatestVersion } from '../../get-latest-version'
import styles from './AppHub.module.css'

const query = {
    appHub: {
        resource: 'appHub/v2/apps',
    },
}

const AppCards = ({ apps }) => {
    const history = useHistory()
    const getIconSrc = app => app.images.find(i => i.logo)?.imageUrl

    return (
        <div className={styles.appCards}>
            {apps.map(app => (
                <button
                    key={app.id}
                    className={styles.appCard}
                    onClick={() => history.push(`/app/${app.id}`)}
                >
                    <AppIcon src={getIconSrc(app)} />
                    <div>
                        <h2 className={styles.appCardName}>{app.name}</h2>
                        <span className={styles.appCardMetadata}>
                            {app.developer.organisation || app.developer.name}
                        </span>
                        <span className={styles.appCardMetadata}>
                            {`Version ${
                                getLatestVersion(app.versions).version
                            }`}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    )
}

AppCards.propTypes = {
    apps: PropTypes.array.isRequired,
}

export const AppHub = () => {
    const { loading, error, data } = useDataQuery(query)

    if (error) {
        return (
            <NoticeBox
                error
                title={i18n.t(
                    'Something went wrong whilst loading App Hub apps'
                )}
            >
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

    return <AppCards apps={data.appHub.result} />
}
