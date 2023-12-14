import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { AppDetails } from '../../components/AppDetails/AppDetails.js'

const query = {
    appHubApp: {
        resource: 'appHub/v1/apps',
        id: ({ appHubId }) => appHubId,
    },
    installedApps: {
        resource: 'apps',
    },
}

export const AppHubApp = ({ match }) => {
    const { appHubId } = match.params
    const history = useHistory()
    const { loading, error, data, refetch } = useDataQuery(query, {
        variables: { appHubId },
    })

    if (error) {
        return (
            <NoticeBox error title={i18n.t('Error loading app')}>
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

    const { appHubApp, installedApps } = data
    if (!appHubApp) {
        return (
            <NoticeBox error title={i18n.t('Error loading app')}>
                {i18n.t('App not found')}
            </NoticeBox>
        )
    }
    const installedApp = installedApps.find(
        (app) => app.app_hub_id === appHubId
    )

    return (
        <AppDetails
            installedApp={installedApp}
            appHubApp={appHubApp}
            onVersionInstall={refetch}
            onUninstall={() => history.push('/app-hub')}
        />
    )
}

AppHubApp.propTypes = {
    match: PropTypes.object.isRequired,
}
