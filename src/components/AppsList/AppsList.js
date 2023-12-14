import i18n from '@dhis2/d2-i18n'
import { InputField } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useQueryParam, StringParam, withDefault } from 'use-query-params'
import { getAppIconSrc } from '../../get-app-icon-src.js'
import { AppCard } from '../AppCard/AppCard.js'
import { AppCards as AppCards_ } from '../AppCards/AppCards.js'
import styles from './AppsList.module.css'

const AppCards = ({ apps }) => {
    const history = useHistory()
    const handleAppClick = (app) => {
        if (!app.version && !app.appHub) {
            return
        }
        history.push(
            app.appHub ? `/app/${app.appHub.id}` : `/installed-app/${app.key}`
        )
    }

    return (
        <AppCards_>
            {apps.map((app) => (
                <AppCard
                    key={app.short_name}
                    iconSrc={getAppIconSrc(app)}
                    appName={app.name}
                    appDeveloper={app.developer?.company || app.developer?.name}
                    appVersion={app.version}
                    onClick={() => handleAppClick(app)}
                />
            ))}
        </AppCards_>
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
            <h1 className={styles.header}>{label}</h1>
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
                <h1 className={styles.header}>{i18n.t('No apps found')}</h1>
                <p>{i18n.t('No apps match your criteria')}</p>
            </>
        )
    }
    return (
        <>
            <h1 className={styles.header}>{label}</h1>
            <AppCards apps={apps} />
        </>
    )
}

AllApps.propTypes = {
    apps: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
}

export const AppsList = ({
    apps,
    appsWithUpdates,
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

    const searchFilter = (app) =>
        !query ||
        app.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    const filteredApps = apps.filter(searchFilter)
    const filteredAppsWithUpdates = (appsWithUpdates || []).filter(searchFilter)

    return (
        <>
            <InputField
                className={styles.searchField}
                value={query}
                placeholder={searchLabel}
                onChange={handleQueryChange}
                type="search"
            />
            <AppsWithUpdates
                apps={filteredAppsWithUpdates}
                label={updatesAvailableLabel}
            />
            <AllApps apps={filteredApps} label={allAppsLabel} />
        </>
    )
}

AppsList.propTypes = {
    allAppsLabel: PropTypes.string.isRequired,
    searchLabel: PropTypes.string.isRequired,
    updatesAvailableLabel: PropTypes.string.isRequired,
    apps: PropTypes.array,
    appsWithUpdates: PropTypes.array,
}
