import semver from 'semver'

const parseVersion = semver.clean

export const semverGt = (a, b) => {
    if (parseVersion(a) === null || parseVersion(b) === null) {
        return false
    }
    return semver.gt(parseVersion(a), parseVersion(b))
}

const satisfiesDhisVersion = (version, dhisVersion) => {
    const { minDhisVersion: min, maxDhisVersion: max } = version
    if (!min && !max) {
        return true
    } else if (min && max) {
        const range = new semver.Range(`${min} - ${max}`)
        return semver.satisfies(dhisVersion, range)
    } else if (!min && max) {
        const range = new semver.Range(`<=${max}`)
        return semver.satisfies(dhisVersion, range)
    } else if (min && !max) {
        const range = new semver.Range(`>=${min}`)
        return semver.satisfies(dhisVersion, range)
    }
}

export const getCompatibleVersions = (
    allVersions,
    dhisVersion,
    channelsFilter = new Set(['stable'])
) => {
    return allVersions
        .filter((version) => channelsFilter.has(version.channel))
        .filter((version) => satisfiesDhisVersion(version, dhisVersion))
}
