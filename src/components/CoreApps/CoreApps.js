import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import getLatestVersion from '../../get-latest-version'
import AppList from '../AppList'

const coreApps = [
    { name: 'App Management', short_name: 'app-management' },
    { name: 'Cache Cleaner', short_name: 'cache-cleaner' },
    { name: 'Capture', short_name: 'capture' },
    { name: 'Dashboard', short_name: 'dashboard' },
    { name: 'Data Administration', short_name: 'data-administration' },
    { name: 'Data Approval', short_name: 'approval' },
    { name: 'Data Entry', short_name: 'dataentry' },
    { name: 'Data Quality', short_name: 'data-quality' },
    { name: 'Data Visualizer', short_name: 'data-visualizer' },
    { name: 'Datastore', short_name: 'datastore' },
    { name: 'Event Reports', short_name: 'event-reports' },
    { name: 'Event Visualizer', short_name: 'event-visualizer' },
    { name: 'Import/Export', short_name: 'import-export' },
    { name: 'Interpretations', short_name: 'interpretation' },
    { name: 'Maintenance', short_name: 'maintenance' },
    { name: 'Maps', short_name: 'maps' },
    { name: 'Menu Management', short_name: 'menu-management' },
    { name: 'Messaging', short_name: 'messaging' },
    { name: 'Pivot Table', short_name: 'pivot' },
    { name: 'Reports', short_name: 'reports' },
    { name: 'SMS Configuration', short_name: 'sms-configuration' },
    { name: 'Scheduler', short_name: 'scheduler' },
    { name: 'System Settings', short_name: 'settings' },
    { name: 'Tracker Capture', short_name: 'tracker-capture' },
    { name: 'Translations', short_name: 'translations' },
    { name: 'Usage Analytics', short_name: 'usage-analytics' },
    { name: 'User Profile', short_name: 'user-profile' },
    { name: 'Users', short_name: 'user' },
].map(coreApp => ({
    ...coreApp,
    key: coreApp.short_name,
    bundled: true,
    developer: {
        company: 'DHIS2',
    },
}))

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

    const overridenCoreApps = data?.coreApps.filter(app => app.bundled)
    const apps = coreApps
        .map(coreApp => {
            const overridenApp = overridenCoreApps?.find(
                a => a.short_name === coreApp.short_name
            )
            if (overridenApp) {
                return overridenApp
            }
            const iconUrl = data?.modules.modules.find(
                m => m.name === `dhis-web-${coreApp.short_name}`
            )?.icon
            const icons = iconUrl ? { 48: iconUrl } : {}
            return {
                ...coreApp,
                baseUrl: `${baseUrl}/dhis-web-${coreApp.short_name}`,
                icons,
            }
        })
        .map(app => ({
            ...app,
            appHub:
                app.app_hub_id &&
                data?.appHub.find(({ id }) => id === app.app_hub_id),
        }))
    const appsWithUpdates = apps.filter(
        app =>
            app.appHub && app.version !== getLatestVersion(app.appHub.versions)
    )

    return (
        <AppList
            error={error}
            loading={loading}
            apps={apps}
            appsWithUpdates={appsWithUpdates}
            errorLabel={i18n.t(
                'Something went wrong whilst loading your core apps'
            )}
            updatesAvailableLabel={i18n.t('Core apps with updates available')}
            allAppsLabel={i18n.t('All core apps')}
            searchLabel={i18n.t('Search core apps')}
        />
    )
}
