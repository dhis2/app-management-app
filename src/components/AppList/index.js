import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import {
    NoticeBox,
    CenteredContent,
    CircularLoader,
    InputField,
} from '@dhis2/ui'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useQueryParam, StringParam, withDefault } from 'use-query-params'
import commonStyles from '../common.module.css'
import AppIcon from './AppIcon'
import styles from './AppList.module.css'

const AppCards = ({ apps }) => {
    const history = useHistory()
    const createClickHandler = appHubId => () => {
        if (appHubId) {
            history.push(`/custom-apps/${appHubId}`)
        }
    }

    return (
        <div className={styles.appCards}>
            {apps.map(app => (
                <button
                    key={app.short_name}
                    className={styles.appCard}
                    disabled={!app.appHubId}
                    onClick={createClickHandler(app.appHubId)}
                >
                    <AppIcon app={app} />
                    <div>
                        <h2 className={styles.appCardName}>{app.name}</h2>
                        <span className={styles.appCardMetadata}>
                            {app.developer?.company || app.developer?.name}
                        </span>
                        <span className={styles.appCardMetadata}>
                            {app.version && `Version ${app.version}`}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    )
}

AppCards.propTypes = {
    apps: PropTypes.array.isRequired,
}

const AppsWithUpdates = ({ label, apps }) => {
    if (apps.length === 0) {
        return null
    }
    return (
        <div className={styles.appsWithUpdates}>
            <h1 className={commonStyles.h1}>{label}</h1>
            <AppCards apps={apps} />
        </div>
    )
}

AppsWithUpdates.propTypes = {
    apps: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
}

const AllApps = ({ label, apps }) => {
    if (apps.length === 0) {
        return (
            <>
                <h1 className={commonStyles.h1}>{i18n.t('No apps found')}</h1>
                <p>No apps match your criteria</p>
            </>
        )
    }
    return (
        <>
            <h1 className={commonStyles.h1}>{label}</h1>
            <AppCards apps={apps} />
        </>
    )
}

AllApps.propTypes = {
    apps: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
}

const AppList = ({
    error,
    loading,
    apps,
    errorLabel,
    updatesAvailableLabel,
    allAppsLabel,
    searchLabel,
}) => {
    const [query, setQuery] = useQueryParam(
        'query',
        withDefault(StringParam, '')
    )
    const handleQueryChange = ({ value }) => {
        setQuery(value, 'replaceIn')
    }

    if (error) {
        return (
            <NoticeBox error title={errorLabel}>
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

    const filteredApps = apps.filter(
        app =>
            !query ||
            app.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    )
    // XXX
    const filteredAppsWithUpdates = filteredApps.filter(
        app => app.name.length % 2 == 0
    )

    return (
        <>
            <InputField
                className={styles.searchField}
                value={query}
                placeholder={searchLabel}
                onChange={handleQueryChange}
            />
            <AppsWithUpdates
                apps={filteredAppsWithUpdates}
                label={updatesAvailableLabel}
            />
            <AllApps apps={filteredApps} label={allAppsLabel} />
        </>
    )
}

AppList.propTypes = {
    allAppsLabel: PropTypes.string.isRequired,
    errorLabel: PropTypes.string.isRequired,
    searchLabel: PropTypes.string.isRequired,
    updatesAvailableLabel: PropTypes.string.isRequired,
    apps: PropTypes.array,
    error: PropTypes.object,
    loading: PropTypes.bool,
}

export default AppList
