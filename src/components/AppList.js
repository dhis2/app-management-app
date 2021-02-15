import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import {
    NoticeBox,
    CenteredContent,
    CircularLoader,
    InputField,
} from '@dhis2/ui'
import React from 'react'
import { useQueryParam, StringParam, withDefault } from 'use-query-params'
import styles from './AppList.module.css'

const AppsWithUpdates = ({ label, apps }) => (
    <>
        <h1 className={styles.header}>{label}</h1>
        {apps.map(app => (
            <p key={app.name}>{app.name}</p>
        ))}
    </>
)

AppsWithUpdates.propTypes = {
    apps: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
}

const AllApps = ({ label, apps }) => (
    <>
        <h1 className={styles.header}>{label}</h1>
        {apps.map(app => (
            <p key={app.name}>{app.name}</p>
        ))}
    </>
)

AllApps.propTypes = {
    apps: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
}

const EmptyApps = (
    <>
        <h1 className={styles.header}>{i18n.t('No apps found')}</h1>
        <p>No apps match your criteria</p>
    </>
)

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
                value={query}
                placeholder={searchLabel}
                onChange={handleQueryChange}
            />
            {filteredAppsWithUpdates.length > 0 ? (
                <AppsWithUpdates
                    apps={filteredAppsWithUpdates}
                    label={updatesAvailableLabel}
                />
            ) : null}
            {filteredApps.length > 0 ? (
                <AllApps apps={filteredApps} label={allAppsLabel} />
            ) : (
                <EmptyApps />
            )}
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
