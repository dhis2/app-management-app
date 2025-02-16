import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { AppDetails } from '../../components/AppDetails/AppDetails.jsx'
import useChangelog from '../../components/AppDetails/useChangelog.js'
import { AppHubErrorNoticeBox } from '../../components/AppHubErrorNoticeBox/AppHubErrorNoticeBox.jsx'

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
    const history = useHistory()
    const appsResponse = useDataQuery(appsQuery)
    const appHubResponse = useDataQuery(appHubQuery, { lazy: true })

    const changelog = useChangelog({
        appId: appHubResponse?.data?.app?.id,
        hasChangelog: appHubResponse?.data?.app?.hasChangelog,
    })

    if (appsResponse.error) {
        return (
            <NoticeBox error title={i18n.t('Error loading app')}>
                {appsResponse.error.message}
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
    const app = installedApps.find((app) => app.key === appKey)
    if (!app) {
        return (
            <NoticeBox error title={i18n.t('Error loading app')}>
                {i18n.t('App not found')}
            </NoticeBox>
        )
    }

    const module = modules.find((app) => app.name === `dhis-web-${appKey}`)
    if (module) {
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
        <>
            {appHubResponse.error && <AppHubErrorNoticeBox />}
            <AppDetails
                installedApp={app}
                appHubApp={appHubResponse.data?.app}
                onVersionInstall={appsResponse.refetch}
                onUninstall={() => history.push('/custom-apps')}
                changelog={changelog}
            />
        </>
    )
}

InstalledApp.propTypes = {
    match: PropTypes.object.isRequired,
}
