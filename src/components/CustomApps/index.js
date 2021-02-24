import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import getLatestVersion from '../../get-latest-version'
import AppList from '../AppList'

const query = {
    customApps: {
        resource: 'apps',
        params: {
            bundled: false,
        },
    },
    appHub: {
        resource: 'appHub/v1/apps',
    },
}

const CustomApps = () => {
    const { loading, error, data } = useDataQuery(query)

    const apps = data?.customApps
        .filter(app => !app.bundled)
        .map(app => ({
            ...app,
            appHub: data.appHub.find(({ id, name, developer }) => {
                if (app.app_hub_id) {
                    return id === app.app_hub_id
                }
                return (
                    name === app.name &&
                    app.developer &&
                    (developer.organisation ===
                        (app.developer.company || app.developer.name) ||
                        developer.name === app.developer.name)
                )
            }),
        }))
    const appsWithUpdates = apps?.filter(
        app =>
            app.appHub && getLatestVersion(app.appHub.versions) !== app.version
    )

    return (
        <AppList
            error={error}
            loading={loading}
            apps={apps}
            appsWithUpdates={appsWithUpdates}
            errorLabel={i18n.t(
                'Something went wrong whilst loading your custom apps'
            )}
            updatesAvailableLabel={i18n.t('Custom apps with updates available')}
            allAppsLabel={i18n.t('All installed custom apps')}
            searchLabel={i18n.t('Search installed custom apps')}
        />
    )
}

export default CustomApps
