import { useConfig } from '@dhis2/app-runtime'
import { queryAllByRole, render } from '@testing-library/react'
import React from 'react'
import { Versions } from './Versions.js'

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    useConfig: jest.fn(),
}))

describe('Versions table', () => {
    const installedVersion = '100.2.27'
    const versions = [
        {
            created: 1700358745976,
            demoUrl: '',
            downloadUrl:
                'https://apps.dhis2.org/api/v1/apps/download/dhis2/app-management_100.2.29.zip',
            id: '6a8fab1a-da21-4340-8c68-92e84eaa4c40',
            lastUpdated: 1700358745976,
            maxDhisVersion: '',
            minDhisVersion: '2.37',
            version: '100.2.29',
            channel: 'stable',
        },
        {
            created: 1694656721047,
            demoUrl: '',
            downloadUrl:
                'https://apps.dhis2.org/api/v1/apps/download/dhis2/app-management_100.2.28.zip',
            id: '447b0753-5064-4bd5-8894-1c64ab26b624',
            lastUpdated: 1694656721047,
            maxDhisVersion: '',
            minDhisVersion: '2.37',
            version: '100.2.28',
            channel: 'stable',
        },
        {
            created: 1690854245259,
            demoUrl: '',
            downloadUrl:
                'https://apps.dhis2.org/api/v1/apps/download/dhis2/app-management_100.2.27.zip',
            id: 'b380f11e-b761-4437-b30e-1d765ef9b06b',
            lastUpdated: 1690854245259,
            maxDhisVersion: '',
            minDhisVersion: '2.37',
            version: '100.2.27',
            channel: 'stable',
        },
    ]

    beforeEach(() => {
        useConfig.mockReturnValue({
            serverVersion: {
                major: 2,
                minor: 37,
                patch: 11,
                tag: 'SNAPSHOT',
            },
        })
    })

    it('should display all compatible versions', () => {
        const onVersionInstall = jest.fn()
        const { getAllByTestId } = render(
            <Versions
                installedVersion={installedVersion}
                versions={versions}
                onVersionInstall={onVersionInstall}
            />
        )

        const rows = getAllByTestId('versions-table-row')
        expect(rows.length).toEqual(versions.length)

        rows.forEach((row, i) => {
            expect(row).toHaveTextContent(versions[i].version)
            expect(row).toHaveTextContent(new RegExp(versions[i].channel, 'i'))
        })
    })

    it('should display "installed" for the installed version', () => {
        const onVersionInstall = jest.fn()
        const { getAllByTestId } = render(
            <Versions
                installedVersion={installedVersion}
                versions={versions}
                onVersionInstall={onVersionInstall}
            />
        )

        const [firstRow, secondRow, thirdRow] =
            getAllByTestId('versions-table-row')

        expect(queryAllByRole(firstRow, 'button')[0]).toHaveTextContent(
            'Install'
        )
        expect(queryAllByRole(secondRow, 'button')[0]).toHaveTextContent(
            'Install'
        )

        const thirdInstalledButton = queryAllByRole(thirdRow, 'button')[0]
        expect(thirdInstalledButton).toHaveTextContent('Installed')
        expect(thirdInstalledButton).toHaveAttribute('disabled')
    })

    it('should display empty table when no compatible versions', () => {
        const onVersionInstall = jest.fn()
        const versionsListWithoutMatch = [
            {
                created: 1702172801684,
                demoUrl: '',
                downloadUrl:
                    'https://apps.dhis2.org/api/v1/apps/download/dhis2/capture_100.47.2.zip',
                id: 'f78e7344-8e95-4f7e-b2d9-fd8d98c30196',
                lastUpdated: 1702172801684,
                maxDhisVersion: '',
                minDhisVersion: '2.38',
                version: '100.47.2',
                channel: 'stable',
            },
            {
                maxDhisVersion: '',
                minDhisVersion: '2.38',
                version: '100.47.1',
                channel: 'stable',
            },
            {
                maxDhisVersion: '',
                minDhisVersion: '2.38',
                version: '100.47.0',
                channel: 'stable',
            },
        ]
        const { getByText } = render(
            <Versions
                installedVersion={installedVersion}
                versions={versionsListWithoutMatch}
                onVersionInstall={onVersionInstall}
            />
        )

        expect(
            getByText('There are no compatible versions matching your criteria')
        ).toBeInTheDocument()
    })
})
