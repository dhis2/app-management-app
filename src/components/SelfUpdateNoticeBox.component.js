/* global __VERSION__ */

import React from 'react'
import PropTypes from 'prop-types'
import { NoticeBox, Button } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'

import actions from '../actions'
import { getTargetVersion } from '../utils/versions'

const currentVersion = __VERSION__
const appManagementAppOrg = 'DHIS2'
const appManagementAppName = 'App Management'

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

    const upgradeSelf = async () => {
        await actions.installAppVersion([targetVersion.id]).toPromise()
        setTimeout(() => location.reload(), 500)
    }
    return (
        <NoticeBox
            title={i18n.t(
                'A new version of App Management is available on the App Hub'
            )}
        >
            <Button onClick={upgradeSelf}>
                {i18n.t('Update and reload app')}
            </Button>
        </NoticeBox>
    )
}

SelfUpdateNoticeBox.propTypes = {
    appHub: PropTypes.object.isRequired,
}
