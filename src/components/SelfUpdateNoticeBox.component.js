/* global __VERSION__,__APP_HUB_ID__ */

import i18n from '@dhis2/d2-i18n'
import { NoticeBox, Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import actions from '../actions'
import { getTargetVersion } from '../utils/versions'

const currentVersion = __VERSION__
const appManagementAppId = __APP_HUB_ID__

export const SelfUpdateNoticeBox = ({ appHub }) => {
    if (!appHub.apps) return null

    // TODO: Fetch app management app from App Hub directly (by id)
    const appManagementApp = appHub.apps.find(
        app => app.id === appManagementAppId
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
