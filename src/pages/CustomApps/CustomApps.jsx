import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import { AppHubErrorNoticeBox } from '../../components/AppHubErrorNoticeBox/AppHubErrorNoticeBox.jsx'
import { AppsList } from '../../components/AppsList/AppsList.jsx'
import { getLatestVersion } from '../../get-latest-version.js'
import { semverGt } from '../../semver-helpers.js'

const query = {
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
    availableApps: {
        resource: 'appHub/v2/apps',
        params: ({ dhis_version }) => ({
            paging: false,
            dhis_version,
        }),
    },
}

export const CustomApps = () => {
    const { systemInfo } = useConfig()
    const { loading, error, data } = useDataQuery(query, {
        variables: {
            dhis_version: systemInfo.version,
        },
    })
    const {
        loading: appHubLoading,
        error: appHubError,
        data: appHubData,
    } = useDataQuery(appHubQuery, {
        variables: {
            dhis_version: systemInfo.version,
        },
    })

    if (error) {
        return (
            <NoticeBox
                error
                title={i18n.t(
                    'Something went wrong whilst loading your custom apps'
                )}
            >
                {error.message}
            </NoticeBox>
        )
    }

    if (loading || appHubLoading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    const apps = data.customApps
        .filter((app) => !app.bundled)
        .map((app) => ({
            ...app,
            appHub:
                app.app_hub_id &&
                appHubData?.availableApps.find(
                    ({ id }) => id === app.app_hub_id
                ),
        }))
    const appsWithUpdates = apps.filter(
        (app) =>
            app.appHub &&
            semverGt(
                getLatestVersion(app.appHub.versions)?.version,
                app.version
            )
    )

    return (
        <div>
            {appHubError && <AppHubErrorNoticeBox />}
            <AppsList
                apps={apps}
                appsWithUpdates={appsWithUpdates}
                updatesAvailableLabel={i18n.t(
                    'Custom apps with updates available'
                )}
                allAppsLabel={i18n.t('All installed custom apps')}
                searchLabel={i18n.t('Search installed custom apps')}
            />
        </div>
    )
}
