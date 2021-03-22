import semver from 'semver'

export const getLatestVersion = versions =>
    versions.reduce((latestVersion, version) => {
        const parsedLatestVersion = semver.coerce(latestVersion.version)
        const parsedVersion = semver.coerce(version.version)
        if (parsedVersion) {
            if (!parsedLatestVersion) {
                return version
            }
            return semver.gt(parsedVersion, parsedLatestVersion)
                ? version
                : latestVersion
        } else {
            return latestVersion
        }
    }, versions[0])
