import PropTypes from 'prop-types'
import React from 'react'
import { appTypeToDisplayName } from '../AppDetails/appDisplayConfig.js'
import PluginTag from '../AppDetails/PluginTag.jsx'
import { AppIcon } from '../AppIcon/AppIcon.jsx'
import styles from './AppCard.module.css'

export const AppCard = ({
    appType,
    hasPlugin,
    pluginType,
    iconSrc,
    appName,
    appDeveloper,
    appVersion,
    onClick,
}) => (
    <button
        data-test={`appcard-${appName}`}
        className={styles.appCard}
        onClick={onClick}
    >
        <AppIcon src={iconSrc} />
        <div>
            <h2 className={styles.appCardName}>{appName}</h2>
            <span className={styles.appCardMetadata}>{appDeveloper}</span>
            {hasPlugin && (
                <div className={styles.tags}>
                    {appTypeToDisplayName[appType] && (
                        <span className={styles.appCardType}>
                            {appTypeToDisplayName[appType]}
                        </span>
                    )}
                    <PluginTag hasPlugin={hasPlugin} pluginType={pluginType} />
                </div>
            )}
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
    appType: PropTypes.string,
    appVersion: PropTypes.string,
    hasPlugin: PropTypes.bool,
    iconSrc: PropTypes.string,
    pluginType: PropTypes.string,
}
