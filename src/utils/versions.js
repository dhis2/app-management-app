import { valid, lt } from 'semver'

export const isUpgradeCandidate = (current, candidate) =>
    valid(current) === null ||
    (valid(candidate) !== null && lt(current, candidate))

export const getTargetVersion = (current, candidates) => {
    if (!candidates || !candidates.length) return null

    let targetVersion
    candidates.forEach(candidate => {
        if (
            isUpgradeCandidate(
                targetVersion?.version || current,
                candidate.version
            )
        ) {
            targetVersion = candidate
        }
    })

    return targetVersion
}
