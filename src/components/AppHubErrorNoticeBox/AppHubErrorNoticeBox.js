import { NoticeBox } from '@dhis2/ui'
import React from 'react'
import i18n from '../../locales/index.js'
import styles from './AppHubErrorNoticeBox.module.css'

export const AppHubErrorNoticeBox = () => (
    <NoticeBox
        error
        title={i18n.t('Failed to check App Hub for available updates')}
        className={styles.noticeBox}
    >
        {i18n.t('Your DHIS2 server might be offline.')}
    </NoticeBox>
)
