import { useConfig, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import {
    InputField,
    Pagination,
    NoticeBox,
    CenteredContent,
    CircularLoader,
} from '@dhis2/ui'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import {
    useQueryParams,
    StringParam,
    NumberParam,
    withDefault,
} from 'use-query-params'
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

const SearchFilter = ({ query, onQueryChange }) => (
    <InputField
        className={styles.searchField}
        placeholder={i18n.t('Search AppHub apps')}
        value={query}
        onChange={({ value }) => onQueryChange(value)}
        type="search"
    />
)

SearchFilter.propTypes = {
    onQueryChange: PropTypes.func.isRequired,
    query: PropTypes.string,
}

const AppsList = ({ apps, pager, onPageChange }) => {
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
    const { systemInfo } = useConfig()
    const [queryParams, setQueryParams] = useQueryParams({
        query: withDefault(StringParam, ''),
        page: withDefault(NumberParam, 1),
    })
    const [debouncedQuery] = useDebounce(queryParams.query, 300)
    const { loading, error, data, called, refetch } = useDataQuery(query, {
        lazy: true,
        variables: {
            dhis_version: systemInfo.version,
            // Setting `paging: true` here (instead of in the query above) is
            // needed due to request caching - react-query serialises this query
            // to the same cache key as the query used by the 'Core apps' and
            // 'Custom apps' pages. However, those queries have pagination set
            // to false and so the shape of their response is different.
            paging: true,
        },
    })

    useEffect(() => {
        refetch(queryParams)
    }, [debouncedQuery, queryParams.page])

    const handleQueryChange = query => {
        setQueryParams({ query, page: 1 }, 'replace')
    }
    const handlePageChange = page => {
        setQueryParams({ page })
    }

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

    return (
        <>
            <SearchFilter
                query={queryParams.query}
                onQueryChange={handleQueryChange}
            />
            {!called || loading ? (
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            ) : (
                <AppsList
                    apps={data.appHub.result}
                    pager={data.appHub.pager}
                    onPageChange={handlePageChange}
                />
            )}
        </>
    )
}
