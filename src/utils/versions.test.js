const { getTargetVersion, isUpgradeCandidate } = require('./versions')

describe('utils::versions', () => {
    describe('isUpgradeCandidate', () => {
        it('Should return true iff candidate is higher than current', () => {
            //lower
            expect(isUpgradeCandidate('3.4.5', '1.0.0')).toBe(false)
            expect(isUpgradeCandidate('3.4.5', '2.7.6')).toBe(false)
            expect(isUpgradeCandidate('3.4.5', '3.4.4')).toBe(false)

            //equal
            expect(isUpgradeCandidate('1.0.0', '1.0.0')).toBe(false)

            //higher
            expect(isUpgradeCandidate('1.0.0', '1.0.1')).toBe(true)
            expect(isUpgradeCandidate('1.0.0', '1.1.0')).toBe(true)
            expect(isUpgradeCandidate('1.0.0', '3.0.4')).toBe(true)
        })
        it('Should ignore invalid candidates', () => {
            expect(isUpgradeCandidate('1.0.0', '1.0.1b')).toBe(false)
            expect(isUpgradeCandidate('1.0.0', '1.1')).toBe(false)
            expect(isUpgradeCandidate('1.0.0', '2')).toBe(false)
        })
        it('Should ignore invalid current', () => {
            expect(isUpgradeCandidate('1.0', '1.0.0')).toBe(true)
        })
        it('Should consider prereleases valid candidates', () => {
            expect(isUpgradeCandidate('1.0.0', '1.0.1-alpha.0')).toBe(true)
        })
    })

    describe('getTargetVersion', () => {
        it('Should detect the highest version', () => {
            const candidates = [
                { version: '2.0.0' },
                { version: '2.1.3' },
                { version: '2.3.4-beta.5' },
                { version: '2.3.4-beta.3' },
            ]
            expect(getTargetVersion('1.0.0', candidates)).toStrictEqual({
                version: '2.3.4-beta.5',
            })

            const candidates2 = [
                { version: '2.0.0' },
                { version: '4.3.3' },
                { version: '2.3.4-beta.5' },
                { version: '2.3.4-beta.3' },
            ]

            expect(getTargetVersion('2.1.1', candidates2)).toStrictEqual({
                version: '4.3.3',
            })
        })
        it('Should return undefined if no upgrade candidate found', () => {
            const candidates = [
                { version: '2.0.0' },
                { version: '4.3.3' },
                { version: '3.3.4-beta.3' },
            ]
            expect(getTargetVersion('5.0.0', candidates)).toBeUndefined()
        })
    })
})
