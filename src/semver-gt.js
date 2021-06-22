import semver from 'semver'

const parseVersion = semver.clean

export const semverGt = (a, b) => {
    if (parseVersion(a) === null || parseVersion(b) === null) {
        return false
    }
    return semver.gt(parseVersion(a), parseVersion(b))
}
