import { CustomDataProvider, Provider } from '@dhis2/app-runtime'
import { render } from '@testing-library/react'
import React from 'react'
import { QueryParamProvider } from 'use-query-params'
import { CoreApps } from './CoreApps.jsx'

const renderWithProvider = (component, dataForCustomProvider = {}) => {
    return render(component, {
        wrapper: ({ children }) => {
            return (
                <QueryParamProvider>
                    <Provider
                        config={{
                            baseUrl: 'http://localhost:8080',
                            systemInfo: {
                                version: 2.4,
                            },
                        }}
                    >
                        <CustomDataProvider
                            data={dataForCustomProvider}
                            options={{ failOnMiss: true }}
                        >
                            {children}
                        </CustomDataProvider>
                    </Provider>
                </QueryParamProvider>
            )
        },
    })
}

describe('Core apps', () => {
    const appHubResponse = [
        {
            name: 'Dashboard',
            description:
                'Present a high level overview of your data in a dashboard...',
        },
    ]
    it('should display icons for v41 and below', async () => {
        const { getAllByTestId, findAllByText } = renderWithProvider(
            <CoreApps />,
            {
                apps: [],
                'action::menu/getModules': () => {
                    return {
                        modules: [
                            {
                                name: 'dhis-web-dashboard',
                                namespace: '/dhis-web-dashboard',
                                defaultAction:
                                    '../dhis-web-dashboard/index.action',
                                displayName: 'Dashboard',
                                icon: '../icons/dhis-web-dashboard.png',
                                description: '',
                            },
                        ],
                    }
                },
                'appHub/v2/apps': appHubResponse,
            }
        )

        await findAllByText('Dashboard')

        expect(
            getAllByTestId('appcard-Dashboard')[0].querySelector('img').src
        ).toBe('http://localhost:8080/icons/dhis-web-dashboard.png')
    })

    it('should display icons for v42+', async () => {
        const { getAllByTestId, findAllByText } = renderWithProvider(
            <CoreApps />,
            {
                apps: [],
                'action::menu/getModules': () => {
                    return {
                        modules: [
                            {
                                name: 'dashboard',
                                namespace: '/api/apps/dashboard',
                                defaultAction:
                                    'http://localhost:8080/dhis-web-dashboard/index.html',
                                displayName: 'Dashboard',
                                icon: '/apps/dashboard/dhis2-app-icon.png',
                                description: 'DHIS2 Dashboard app',
                                version: '101.2.1',
                                shortcuts: [],
                            },
                        ],
                    }
                },
                'appHub/v2/apps': appHubResponse,
            }
        )

        await findAllByText('Dashboard')

        expect(
            getAllByTestId('appcard-Dashboard')[0].querySelector('img').src
        ).toBe('http://localhost:8080/api/apps/dashboard/dhis2-app-icon.png')
    })
})
