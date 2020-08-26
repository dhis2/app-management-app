/* global __VERSION__ */

import React from 'react'
import PropTypes from 'prop-types'
import { NoticeBox } from '@dhis2/ui'

import actions from '../actions'

const currentVersion = __VERSION__
const appManagementAppOrg = 'DHIS2'
const appManagementAppName = 'App Management'

const parseVersion = versionString => versionString.split('.').map(Number)
const needsUpdate = (current, candidate) => {
    const currentVersion = parseVersion(current)
    const candidateVersion = parseVersion(candidate)

    return currentVersion.some((v, i) => v < candidateVersion[i])
}

const getTargetVersion = (current, versions) => {
    if (!versions) return null

    let targetVersion
    versions.forEach(candidate => {
        if (needsUpdate(targetVersion?.version || current, candidate.version)) {
            targetVersion = candidate
        }
    })

    return targetVersion
}

export const SelfUpdateNoticeBox = ({ appHub }) => {
    if (!appHub.apps) return null

    const appManagementApp = appHub.apps.find(
        app =>
            app.developer.organisation === appManagementAppOrg &&
            app.name === appManagementAppName
    )

    const targetVersion = getTargetVersion(
        currentVersion,
        appManagementApp?.versions
    )
    if (!appManagementApp || !targetVersion) {
        return null
    }

    const upgradeSelf = async e => {
        e.preventDefault()

        console.log('Upgrading to ', targetVersion)
        await actions.installAppVersion([targetVersion.id]).toPromise()

        setTimeout(() => location.reload(), 500)
    }
    return (
        <NoticeBox title="A new version of App Management is available on the App Hub">
            To update the App Management app to version {targetVersion.version}{' '}
            in your DHIS2 instance,{' '}
            <a href="#" onClick={upgradeSelf}>
                click here
            </a>
        </NoticeBox>
    )
}

SelfUpdateNoticeBox.propTypes = {
    appHub: PropTypes.object.isRequired,
}
