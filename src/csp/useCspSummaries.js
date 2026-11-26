import { useDataQuery } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import { CSP_API } from './constants.js'

const summaryQuery = {
    summary: {
        resource: `${CSP_API}/apps`,
    },
}

/**
 * CSP summaries keyed by app key, for the list badges. Servers without the
 * CSP override API (or users without access) just get no badges.
 */
export const useCspSummaries = () => {
    const { data, error } = useDataQuery(summaryQuery)
    return useMemo(() => {
        const byKey = {}
        if (!error) {
            ;(data?.summary?.apps || []).forEach((app) => {
                byKey[app.appKey] = app
            })
        }
        return byKey
    }, [data, error])
}
