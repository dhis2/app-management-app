import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { AppDetails } from '../../components/AppDetails/AppDetails.jsx'
import useChangelog from '../../components/AppDetails/useChangelog.js'

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

    const changelog = useChangelog({
        appId: appHubId,
        hasChangelog: data?.appHubApp?.hasChangelog,
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

    // ToDo: This is a workaround to match non-core apps to fix this bug https://dhis2.atlassian.net/browse/DHIS2-15586
    // we don't have an app ID for these apps, so we can't reliably match them. This is the best we can do for now:
    // to match with the name + developer email
    const matchesNonCoreApp = (installedApp, appHubDetails) => {
        return (
            !installedApp.app_hub_id &&
            installedApp.name === appHubDetails.name &&
            installedApp.developer?.email === appHubDetails.developer?.email
        )
    }

    const installedApp = installedApps.find(
        (app) =>
            app.app_hub_id === appHubId || matchesNonCoreApp(app, appHubApp)
    )

    return (
        <AppDetails
            installedApp={installedApp}
            appHubApp={appHubApp}
            onVersionInstall={refetch}
            onUninstall={() => history.push('/app-hub')}
            changelog={changelog}
        />
    )
}

AppHubApp.propTypes = {
    match: PropTypes.object.isRequired,
}
