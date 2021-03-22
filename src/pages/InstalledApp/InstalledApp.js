import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import { AppDetails } from '../../components/AppDetails/AppDetails'
import { coreApps } from '../../core-apps'

const appsQuery = {
    modules: {
        resource: 'action::menu/getModules',
    },
    installedApps: {
        resource: 'apps',
    },
}

const appHubQuery = {
    app: {
        resource: `appHub/v1/apps`,
        id: ({ appHubId }) => appHubId,
    },
}

export const InstalledApp = ({ match }) => {
    const { appKey } = match.params
    const appsResponse = useDataQuery(appsQuery)
    const appHubResponse = useDataQuery(appHubQuery, { lazy: true })

    if (appsResponse.error || appHubResponse.error) {
        return (
            <NoticeBox error title={i18n.t('Error loading app')}>
                {(appsResponse.error || appHubResponse.error).message}
            </NoticeBox>
        )
    }

    if (appsResponse.loading || appHubResponse.loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    const {
        modules: { modules },
        installedApps,
    } = appsResponse.data
    const coreApp = coreApps.find(app => app.key === appKey)
    const app = installedApps.find(app => app.key === appKey) || coreApp
    if (!app) {
        return (
            <NoticeBox error title={i18n.t('Error loading app')}>
                {i18n.t('App not found')}
            </NoticeBox>
        )
    }

    const module = modules.find(app => app.name === `dhis-web-${appKey}`)
    // If the app is a core app, then `module.displayName` should contain its translated name
    if (coreApp && module) {
        app.name = module.displayName
    }

    if (app.app_hub_id && !appHubResponse.called) {
        appHubResponse.refetch({ appHubId: app.app_hub_id })
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    return (
        <AppDetails
            installedApp={app}
            appHubApp={appHubResponse.data?.app}
            onVersionInstall={appsResponse.refetch}
        />
    )
}

InstalledApp.propTypes = {
    match: PropTypes.object.isRequired,
}
