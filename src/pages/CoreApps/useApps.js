import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import { coreApps } from '../../core-apps'
import { getLatestVersion } from '../../get-latest-version'
import { semverGt } from '../../semver-gt'

const installedAppsQuery = {
    overriddenCoreApps: {
        resource: 'apps',
        params: {
            filter: 'bundled:eq:true',
        },
    },
    modules: {
        resource: 'action::menu/getModules',
    },
}

const appHubQuery = {
    availableCoreApps: {
        resource: 'appHub/v2/apps',
        params: ({ dhis_version }) => ({
            paging: false,
            core: true,
            dhis_version,
        }),
    },
}

export const useApps = () => {
    const { baseUrl, systemInfo } = useConfig()
    const {
        loading: installedAppsLoading,
        error: installedAppsError,
        data: installedAppsData,
    } = useDataQuery(installedAppsQuery)
    const {
        loading: appHubLoading,
        error: appHubError,
        data: appHubData,
    } = useDataQuery(appHubQuery, {
        variables: {
            dhis_version: systemInfo.version,
        },
    })

    const appsByShortName = {}
    appHubData?.availableCoreApps.forEach(app => {
        const coreApp = coreApps.find(({ name }) => name === app.name)
        if (!coreApp) {
            return
        }
        const { shortName } = coreApp
        const module = installedAppsData?.modules.modules.find(
            m => m.name === `dhis-web-${shortName}`
        )
        const name = module?.displayName || app.name
        const iconUrl = module?.icon
        const icons = iconUrl ? { 48: iconUrl } : {}
        appsByShortName[shortName] = {
            short_name: shortName,
            appHub: app,
            baseUrl: `${baseUrl}/dhis-web-${shortName}`,
            name,
            icons,
        }
    })
    installedAppsData?.overriddenCoreApps.forEach(app => {
        if (!(app.short_name in appsByShortName)) {
            appsByShortName[app.short_name] = app
        }
        appsByShortName[app.short_name].version = app.version
    })
    const apps = Object.values(appsByShortName)
    const appsWithUpdates = apps.filter(
        app =>
            app.appHub &&
            (!app.version ||
                semverGt(
                    getLatestVersion(app.appHub.versions)?.version,
                    app.version
                ))
    )

    return {
        loading: installedAppsLoading || appHubLoading,
        error: installedAppsError,
        appHubError,
        apps,
        appsWithUpdates,
    }
}
