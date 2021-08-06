import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import { AppsList } from '../../components/AppsList/AppsList'
import { coreApps } from '../../core-apps'
import { getLatestVersion } from '../../get-latest-version'
import { semverGt } from '../../semver-gt'

const query = {
    overriddenCoreApps: {
        resource: 'apps',
        params: {
            filter: 'bundled:eq:true',
        },
    },
    availableCoreApps: {
        resource: 'appHub/v2/apps',
        params: ({ dhis_version }) => ({
            paging: false,
            core: true,
            dhis_version,
        }),
    },
    modules: {
        resource: 'action::menu/getModules',
    },
}

export const CoreApps = () => {
    const { baseUrl, systemInfo } = useConfig()
    const { loading, error, data } = useDataQuery(query, {
        variables: {
            dhis_version: systemInfo.version,
        },
    })

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

    const appsByShortName = {}
    data.availableCoreApps.forEach(app => {
        const coreApp = coreApps.find(({ name }) => name === app.name)
        if (!coreApp) {
            return
        }
        const { shortName } = coreApp
        const module = data.modules.modules.find(
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
    data.overriddenCoreApps.forEach(app => {
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

    return (
        <AppsList
            apps={apps}
            appsWithUpdates={appsWithUpdates}
            updatesAvailableLabel={i18n.t('Core apps with updates available')}
            allAppsLabel={i18n.t('All core apps')}
            searchLabel={i18n.t('Search core apps')}
        />
    )
}
