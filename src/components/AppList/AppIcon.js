import { PropTypes } from '@dhis2/prop-types'
import React from 'react'
import styles from './AppIcon.module.css'

const getIconSrc = app => {
    const iconSize = ['128', '48', '16'].find(iconSize => iconSize in app.icons)
    if (iconSize) {
        return `${app.baseUrl}/${app.icons[iconSize]}`
    }
    return null
}

const AppIcon = ({ app }) => (
    <div className={styles.appIcon}>
        {getIconSrc(app) ? (
            <img src={getIconSrc(app)} />
        ) : (
            <div className={styles.appIconFallback}></div>
        )}
    </div>
)

AppIcon.propTypes = {
    app: PropTypes.object.isRequired,
}

export default AppIcon
