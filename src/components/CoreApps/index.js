import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import getLatestVersion from '../../get-latest-version'
import AppList from '../AppList'

const coreAppNames = [
    'App Management',
    'Cache Cleaner',
    'Capture',
    'Dashboard',
    'Data Visualizer',
    'Datastore Management',
    'Import/Export',
    'Interpretations',
    'Maintenance',
    'Menu Management',
    'Messaging',
    'Reports',
    'SMS Configuration',
    'Scheduler',
    'Settings',
    'Translations',
    'User Management',
]

const query = {
    coreApps: {
        resource: 'apps',
        params: {
            bundled: true,
        },
    },
    appHub: {
        resource: 'appHub/v1/apps',
    },
}

const CoreApps = () => {
    const { loading, error, data } = useDataQuery(query)

    const overridenCoreApps = data?.coreApps.filter(app => app.bundled)
    const apps = coreAppNames
        .map(coreAppName => {
            const overridenApp = overridenCoreApps?.find(
                a => a.name === coreAppName
            )
            if (overridenApp) {
                return overridenApp
            }
            return {
                name: coreAppName,
                bundled: true,
                short_name: coreAppName,
                developer: {
                    company: 'DHIS2',
                },
                icons: {},
            }
        })
        .map(app => ({
            ...app,
            appHub: data?.appHub.find(
                ({ name, developer }) =>
                    name === app.name && developer.organisation === 'DHIS2'
            ),
        }))
    const appsWithUpdates = apps.filter(
        app =>
            (!app.version && app.appHub?.id) ||
            (app.appHub &&
                app.version !== getLatestVersion(app.appHub.versions))
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

export default CoreApps
