import PropTypes from 'prop-types'
import React from 'react'
import { AppIcon } from '../AppIcon/AppIcon.jsx'
import styles from './AppCard.module.css'

export const AppCard = ({
    iconSrc,
    appName,
    appDeveloper,
    appVersion,
    onClick,
}) => (
    <button className={styles.appCard} onClick={onClick}>
        <AppIcon src={iconSrc} />
        <div>
            <h2 className={styles.appCardName}>{appName}</h2>
            <span className={styles.appCardMetadata}>{appDeveloper}</span>
            <span className={styles.appCardMetadata}>
                {appVersion && `Version ${appVersion}`}
            </span>
        </div>
    </button>
)

AppCard.propTypes = {
    appName: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    appDeveloper: PropTypes.string,
    appVersion: PropTypes.string,
    iconSrc: PropTypes.string,
}
