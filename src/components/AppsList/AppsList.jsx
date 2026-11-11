import i18n from '@dhis2/d2-i18n'
import { Checkbox, InputField } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useQueryParam, StringParam, withDefault } from 'use-query-params'
import { useCspSummaries } from '../../csp/useCspSummaries.js'
import { getAppIconSrc } from '../../get-app-icon-src.js'
import { AppCard } from '../AppCard/AppCard.jsx'
import { AppCards as AppCards_ } from '../AppCards/AppCards.jsx'
import styles from './AppsList.module.css'

const AppCards = ({ apps }) => {
    const history = useHistory()
    const cspSummaries = useCspSummaries()
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
                    hasPlugin={app.hasPlugin}
                    pluginType={app.pluginType}
                    appType={app.appType}
                    key={app.short_name}
                    iconSrc={getAppIconSrc(app)}
                    appName={app.name}
                    appDeveloper={app.developer?.company || app.developer?.name}
                    appVersion={app.version}
                    cspSummary={cspSummaries[app.key || app.short_name]}
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
    const cspSummaries = useCspSummaries()
    const [cspFilter, setCspFilter] = useQueryParam(
        'csp',
        withDefault(StringParam, '')
    )
    const hasBlockedViolations = (app) =>
        (cspSummaries[app.key || app.short_name]?.violations24h?.enforce || 0) >
        0
    const blockedCount = apps.filter(hasBlockedViolations).length

    const searchFilter = (app) =>
        (!query ||
            app.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())) &&
        (cspFilter !== 'blocked' || hasBlockedViolations(app))
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
            {(blockedCount > 0 || cspFilter === 'blocked') && (
                <Checkbox
                    className={styles.cspFilter}
                    checked={cspFilter === 'blocked'}
                    onChange={({ checked }) =>
                        setCspFilter(checked ? 'blocked' : '', 'replaceIn')
                    }
                    label={i18n.t(
                        'Only apps with blocked CSP violations ({{count}})',
                        { count: blockedCount }
                    )}
                    dataTest="csp-filter-blocked"
                />
            )}
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
