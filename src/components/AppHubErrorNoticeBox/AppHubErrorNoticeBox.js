import React from 'react'
import { NoticeBox } from '@dhis2/ui'
import styles from './AppHubErrorNoticeBox.module.css'
import i18n from '../../locales/index.js'

export const AppHubErrorNoticeBox = () => 
    <NoticeBox
        error
        title={i18n.t(
            'Failed to check App Hub for available updates'
        )}
        className={styles.NoticeBox}
    >
        {i18n.t('Your DHIS2 server might be offline.')}
    </NoticeBox>