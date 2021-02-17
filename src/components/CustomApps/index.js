import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React from 'react'
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
            appHubId: data.appHub.find(
                ({ name, developer }) =>
                    name == app.name &&
                    app.developer &&
                    (developer.organisation ==
                        (app.developer.company || app.developer.name) ||
                        developer.name == app.developer.name)
            )?.id,
        }))

    return (
        <AppList
            error={error}
            loading={loading}
            apps={apps}
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
