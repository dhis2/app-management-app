import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import { Menu, MenuItem } from '@dhis2/ui'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styles from './Sidebar.module.css'

const useIsItemActive = (path, exactMatch) => {
    const routeMatch = useRouteMatch(path)

    if (!routeMatch) return false
    if (exactMatch) return routeMatch.isExact
    return true
}

const SidebarItem = ({ label, path, exactMatch = false }) => {
    const history = useHistory()
    const isActive = useIsItemActive(path, exactMatch)
    const navigateToPath = () => history.push(path)

    return (
        <MenuItem
            className={styles.sidebarItem}
            onClick={navigateToPath}
            active={isActive}
            label={label}
        />
    )
}

SidebarItem.propTypes = {
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    exactMatch: PropTypes.bool,
}

const showCoreApps = ({ minor, patch }) =>
    minor > 35 || (minor == 35 && patch >= 2)

export const Sidebar = () => (
    <Menu>
        {showCoreApps(useConfig().serverVersion) ? (
            <SidebarItem
                label={i18n.t('Preinstalled core apps')}
                path="/"
                exactMatch={true}
            />
        ) : null}
        <SidebarItem label={i18n.t('Custom apps')} path="/custom-apps" />
        <SidebarItem label={i18n.t('App Hub')} path="/app-hub" />
        <SidebarItem label={i18n.t('Manual install')} path="/manual-install" />
    </Menu>
)
