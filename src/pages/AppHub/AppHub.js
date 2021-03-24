import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { AppCard } from '../../components/AppCard/AppCard'
import { AppCards } from '../../components/AppCards/AppCards'
import { getLatestVersion } from '../../get-latest-version'

const query = {
    appHub: {
        resource: 'appHub/v2/apps',
    },
}

const AppsList = ({ apps }) => {
    const history = useHistory()
    const getIconSrc = app => app.images.find(i => i.logo)?.imageUrl

    return (
        <AppCards>
            {apps.map(app => (
                <AppCard
                    key={app.id}
                    iconSrc={getIconSrc(app)}
                    appName={app.name}
                    appDeveloper={
                        app.developer.organisation || app.developer.name
                    }
                    appVersion={getLatestVersion(app.versions).version}
                    onClick={() => history.push(`/app/${app.id}`)}
                />
            ))}
        </AppCards>
    )
}

AppsList.propTypes = {
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

    return <AppsList apps={data.appHub.result} />
}
