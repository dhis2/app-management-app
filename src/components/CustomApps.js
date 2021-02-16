import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import AppList from './AppList'

const query = {
    customApps: {
        resource: 'apps',
    },
}

const CustomApps = () => {
    const { loading, error, data } = useDataQuery(query)

    return (
        <AppList
            error={error}
            loading={loading}
            apps={data?.customApps.filter(app => !app.bundled)}
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
