import { getCompatibleVersions, toDhisVersion } from './semver-helpers.js'

const stableVersion = (dhisVersionRange) => ({
    version: '1.0.0',
    channel: 'stable',
    ...dhisVersionRange,
})

const isCompatible = (dhisVersionRange, serverVersion) =>
    getCompatibleVersions(
        [stableVersion(dhisVersionRange)],
        toDhisVersion(serverVersion)
    ).length === 1

describe('getCompatibleVersions with the server version', () => {
    it('excludes a version whose patch-level minimum is above the server patch', () => {
        expect(
            isCompatible(
                { minDhisVersion: '2.43.3' },
                { major: 2, minor: 43, patch: 2 }
            )
        ).toBe(false)
    })

    it('includes a version whose patch-level minimum equals the server patch', () => {
        expect(
            isCompatible(
                { minDhisVersion: '2.43.3' },
                { major: 2, minor: 43, patch: 3 }
            )
        ).toBe(true)
    })

    it('includes a version whose patch-level minimum is below the server patch', () => {
        expect(
            isCompatible(
                { minDhisVersion: '2.43.3' },
                { major: 2, minor: 43, patch: 4, tag: 'SNAPSHOT' }
            )
        ).toBe(true)
    })

    it('includes a version with a minor-level minimum on any patch of that minor', () => {
        expect(
            isCompatible(
                { minDhisVersion: '2.43' },
                { major: 2, minor: 43, patch: 0 }
            )
        ).toBe(true)
    })

    it('includes a version with a minor-level maximum on a later patch of that minor', () => {
        expect(
            isCompatible(
                { minDhisVersion: '2.40', maxDhisVersion: '2.43' },
                { major: 2, minor: 43, patch: 5 }
            )
        ).toBe(true)
    })

    it('treats a server version without a patch as patch 0', () => {
        expect(
            isCompatible({ minDhisVersion: '2.43.3' }, { major: 2, minor: 43 })
        ).toBe(false)
        expect(
            isCompatible({ minDhisVersion: '2.43' }, { major: 2, minor: 43 })
        ).toBe(true)
    })
})
