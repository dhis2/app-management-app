import { getLatestVersion } from './get-latest-version.js'

describe('getLatestVersion', () => {
    it('returns the highest version', () => {
        const versions = [
            { version: '1.2.0' },
            { version: '1.10.0' },
            { version: '1.9.3' },
        ]
        expect(getLatestVersion(versions)).toEqual({ version: '1.10.0' })
    })

    it('returns undefined when there are no versions', () => {
        expect(getLatestVersion([])).toBeUndefined()
    })
})
