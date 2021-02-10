import semver from 'semver'

const parseVersion = semver.clean
const semverGt = (a, b) => {
    if (parseVersion(a) === null || parseVersion(b) === null) {
        return false
    }
    return semver.gt(parseVersion(a), parseVersion(b))
}

export default versions => {
    if (!versions) {
        return null
    }

    let latestVersion = versions[0]
    versions.forEach(candidate => {
        if (semverGt(candidate.version, latestVersion.version)) {
            latestVersion = candidate
        }
    })
    return latestVersion
}
