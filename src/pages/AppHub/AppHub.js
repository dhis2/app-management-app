import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import { InputField, Pagination } from '@dhis2/ui'
import { NoticeBox, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { AppCard } from '../../components/AppCard/AppCard'
import { AppCards as AppCards_ } from '../../components/AppCards/AppCards'
import { getLatestVersion } from '../../get-latest-version'
import styles from './AppHub.module.css'

const query = {
    appHub: {
        resource: 'appHub/v2/apps',
        params: params => ({
            pageSize: 24,
            ...params,
        }),
    },
}

const AppCards = ({ apps }) => {
    const history = useHistory()
    const getIconSrc = app => app.images.find(i => i.logo)?.imageUrl

    return (
        <AppCards_>
            {apps.map(app => (
                <AppCard
                    key={app.id}
                    iconSrc={getIconSrc(app)}
                    appName={app.name}
                    appDeveloper={
                        app.developer.organisation || app.developer.name
                    }
                    appVersion={getLatestVersion(app.versions).version}
                    onClick={() => history.push(`/app/${app.id}`)}
                />
            ))}
        </AppCards_>
    )
}

AppCards.propTypes = {
    apps: PropTypes.array.isRequired,
}

const SearchFilter = ({ onQueryChange }) => {
    return (
        <InputField
            className={styles.searchField}
            placeholder={i18n.t('Search AppHub apps')}
            onChange={onQueryChange}
            type="search"
        />
    )
}

const AppsList = ({ apps, onQueryChange, pager, onPageChange }) => {
    // TODO: Add search filter and `onQueryChange`

    return (
        <>
            <SearchFilter onQueryChange={onQueryChange} />
            <AppCards apps={apps} />
            <div className={styles.paginationWrapper}>
                <Pagination
                    hidePageSizeSelect
                    onPageChange={onPageChange}
                    {...pager}
                />
            </div>
        </>
    )
}

AppsList.propTypes = {
    apps: PropTypes.array.isRequired,
    pager: PropTypes.object.isRequired,
    onPageChange: PropTypes.func.isRequired,
}

export const AppHub = () => {
    const { loading, error, data, refetch } = useDataQuery(query)
    const handleQueryChange = query => refetch({ query })
    const handlePageChange = page => refetch({ page })

    if (error) {
        return (
            <NoticeBox
                error
                title={i18n.t(
                    'Something went wrong whilst loading App Hub apps'
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
        <AppsList
            apps={data.appHub.result}
            pager={data.appHub.pager}
            onQueryChange={handleQueryChange}
            onPageChange={handlePageChange}
        />
    )
}
