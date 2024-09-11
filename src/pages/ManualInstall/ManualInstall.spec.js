import { Provider } from '@dhis2/app-runtime'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import '@testing-library/jest-dom'
import { useHistory } from 'react-router-dom'
import { MockAlertStack } from '../../test-utils/index.js'
import { ManualInstall } from './ManualInstall.js'

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(() => ({
        push: jest.fn(),
    })),
}))

const renderWithProvider = (component) => {
    return render(component, {
        wrapper: ({ children }) => {
            return (
                <Provider config={{}}>
                    {children}
                    <MockAlertStack />
                </Provider>
            )
        },
    })
}
describe('Manual Install', () => {
    const historyPush = jest.fn()

    beforeEach(() => {
        global.fetch = jest.fn()
        useHistory.mockImplementation(() => ({ push: historyPush }))
    })

    afterEach(() => {
        delete global.fetch
        jest.resetAllMocks()
    })

    it('should allow navigating to the app', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            text: () =>
                Promise.resolve(
                    JSON.stringify({ app_hub_id: 'some_apphub_id' })
                ),
        })

        const { getByTestId, getByText, findByText } = renderWithProvider(
            <ManualInstall />
        )

        const fileInput = getByTestId('file-upload')
        userEvent.upload(fileInput, 'testfile')

        await findByText('App installed successfully')
        await userEvent.click(getByText('View app details'))
        expect(historyPush).toHaveBeenCalledWith('/app/some_apphub_id')
    })

    it('should work with an empty response (pre v41)', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            text: () => null,
        })

        const { getByTestId, findByText, queryByText } = renderWithProvider(
            <ManualInstall />
        )

        const fileInput = getByTestId('file-upload')
        userEvent.upload(fileInput, 'testfile')

        await findByText('App installed successfully')
        expect(queryByText('View app details')).not.toBeInTheDocument()
        expect(historyPush).not.toHaveBeenCalled()
    })

    it('should show an error if it fails', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValue('upload failed')

        const { getByTestId, findByText, queryByText } = renderWithProvider(
            <ManualInstall />
        )

        const fileInput = getByTestId('file-upload')
        userEvent.upload(fileInput, 'testfile')

        await findByText('Failed to install app:')
        expect(queryByText('View app details')).not.toBeInTheDocument()
        expect(historyPush).not.toHaveBeenCalled()
    })
})
