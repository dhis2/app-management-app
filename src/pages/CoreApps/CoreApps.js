import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import { AppList } from '../../components/AppList/AppList'
import { coreApps } from '../../core-apps'
import { getLatestVersion } from '../../get-latest-version'
import { semverGt } from '../../semver-gt'

const query = {
    coreApps: {
        resource: 'apps',
        params: {
            bundled: true,
        },
    },
    // TODO: Add ability to request certain app IDs to `/v2/apps` API and use
    // that instead
    appHub: {
        resource: 'appHub/v1/apps',
    },
    modules: {
        resource: 'action::menu/getModules',
    },
}

export const CoreApps = () => {
    const { baseUrl } = useConfig()
    const { loading, error, data } = useDataQuery(query)

    if (error) {
        return (
            <NoticeBox
                error
                title={i18n.t(
                    'Something went wrong whilst loading your core apps'
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

    const overridenCoreApps = data.coreApps.filter(app => app.bundled)
    const apps = coreApps
        .map(coreApp => {
            const overridenApp = overridenCoreApps?.find(
                a => a.short_name === coreApp.short_name
            )
            if (overridenApp) {
                return overridenApp
            }
            const module = data.modules.modules.find(
                m => m.name === `dhis-web-${coreApp.short_name}`
            )
            const iconUrl = module?.icon
            const icons = iconUrl ? { 48: iconUrl } : {}
            const name = module?.displayName || coreApp.name
            return {
                ...coreApp,
                baseUrl: `${baseUrl}/dhis-web-${coreApp.short_name}`,
                name,
                icons,
            }
        })
        .map(app => ({
            ...app,
            appHub:
                app.app_hub_id &&
                data.appHub.find(({ id }) => id === app.app_hub_id),
        }))
    const appsWithUpdates = apps.filter(
        app =>
            app.appHub &&
            semverGt(
                getLatestVersion(app.appHub.versions)?.version,
                app.version
            )
    )

    return (
        <AppList
            apps={apps}
            appsWithUpdates={appsWithUpdates}
            updatesAvailableLabel={i18n.t('Core apps with updates available')}
            allAppsLabel={i18n.t('All core apps')}
            searchLabel={i18n.t('Search core apps')}
        />
    )
}
