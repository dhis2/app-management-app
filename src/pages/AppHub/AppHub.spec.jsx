import { useConfig, useDataQuery } from '@dhis2/app-runtime'
import { render } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'
import { AppHub } from './AppHub.jsx'

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    useConfig: jest.fn(),
    useDataQuery: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(() => ({ push: jest.fn() })),
}))

jest.mock('use-query-params', () => ({
    ...jest.requireActual('use-query-params'),
    useQueryParams: jest.fn(() => [{ query: '', page: 1 }, jest.fn()]),
}))

const stableApp = {
    appType: 'APP',
    id: 'c9e35f66-3204-45a9-90fe-9227a29ab935',
    name: 'Cache Cleaner',
    hasPlugin: null,
    pluginType: null,
    developer: { organisation: 'DHIS2' },
    images: [],
    versions: [
        { id: '1', version: '100.2.1', channel: 'stable' },
        { id: '2', version: '100.2.2', channel: 'stable' },
    ],
}

// App Hub can return apps that only have versions in non-stable channels
const developmentOnlyApp = {
    appType: 'APP',
    id: 'ddd3734c-560d-49f0-8ded-2cdbb148d0e2',
    name: 'Bulk Data Entry Plugin',
    hasPlugin: true,
    pluginType: null,
    developer: { organisation: 'DHIS2' },
    images: [],
    versions: [
        {
            id: '60fdc06d-e207-4487-b4d4-62bf2e085c0b',
            version: '0.1.0',
            minDhisVersion: '2.41',
            maxDhisVersion: '',
            channel: 'development',
        },
    ],
}

describe('AppHub', () => {
    beforeEach(() => {
        useConfig.mockReturnValue({ systemInfo: { version: '2.42.6' } })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders apps that have no stable version', () => {
        useDataQuery.mockReturnValue({
            loading: false,
            error: undefined,
            called: true,
            refetch: jest.fn(),
            data: {
                appHub: {
                    pager: { page: 1, pageSize: 24, pageCount: 1, total: 2 },
                    result: [stableApp, developmentOnlyApp],
                },
            },
        })

        const { getByText, queryByText } = render(<AppHub />)

        expect(getByText('Bulk Data Entry Plugin')).toBeInTheDocument()
        expect(queryByText('Version 0.1.0')).not.toBeInTheDocument()
        expect(getByText('Cache Cleaner')).toBeInTheDocument()
        expect(getByText('Version 100.2.2')).toBeInTheDocument()
    })
})
