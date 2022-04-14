import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import { getLatestVersion } from '../../get-latest-version'
import { semverGt } from '../../semver-gt'

const customAppsQuery = {
    customApps: {
        resource: 'apps',
        params: {
            bundled: false,
        },
    },
}

const appHubQuery = {
    // TODO: Add ability to request certain app IDs to `/v2/apps` API and use
    // that instead
    appHub: {
        resource: 'appHub/v2/apps',
        params: ({ dhis_version }) => ({
            paging: false,
            dhis_version,
        }),
    },
}

export const useApps = () => {
    const { systemInfo } = useConfig()
    const {
        loading: customAppsLoading,
        error: customAppsError,
        data: customAppsData,
    } = useDataQuery(customAppsQuery)
    const {
        loading: appHubLoading,
        error: appHubError,
        data: appHubData,
    } = useDataQuery(appHubQuery, {
        variables: {
            dhis_version: systemInfo.version,
        },
    })

    const apps = customAppsData?.customApps
        .filter(app => !app.bundled)
        .map(app => ({
            ...app,
            appHub:
                app.app_hub_id &&
                appHubData?.appHub.find(({ id }) => id === app.app_hub_id),
        }))
    const appsWithUpdates = apps?.filter(
        app =>
            app.appHub &&
            semverGt(
                getLatestVersion(app.appHub.versions)?.version,
                app.version
            )
    )

    return {
        loading: customAppsLoading || appHubLoading,
        error: customAppsError,
        appHubError,
        apps,
        appsWithUpdates,
    }
}
