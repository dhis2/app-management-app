import semver from 'semver'

// TODO: Only return versions from stable channel?
// Or take channel as param and get latest version for same channel as installed
// app with stable being default

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
