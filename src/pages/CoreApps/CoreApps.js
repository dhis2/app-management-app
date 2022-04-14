import i18n from '@dhis2/d2-i18n'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import { AppsList } from '../../components/AppsList/AppsList'
import styles from './CoreApps.module.css'
import { useApps } from './useApps'

export const CoreApps = () => {
    const { loading, error, appHubError, apps, appsWithUpdates } = useApps()

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

    return (
        <>
            {appHubError && (
                <NoticeBox
                    className={styles.appHubWarning}
                    warning
                    title={i18n.t('Failed to connect to the App Hub')}
                >
                    {i18n.t('You will not see updates for installed apps.')}
                </NoticeBox>
            )}
            <AppsList
                apps={apps}
                appsWithUpdates={appsWithUpdates}
                updatesAvailableLabel={i18n.t(
                    'Core apps with updates available'
                )}
                allAppsLabel={i18n.t('All core apps')}
                searchLabel={i18n.t('Search core apps')}
            />
        </>
    )
}
