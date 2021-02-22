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

const Sidebar = () => (
    <Menu>
        <SidebarItem
            label={i18n.t('Preinstalled core apps')}
            path="/"
            exactMatch={true}
        />
        <SidebarItem label={i18n.t('Custom apps')} path="/custom-apps" />
        <SidebarItem label={i18n.t('Manual install')} path="/manual-install" />
    </Menu>
)

export default Sidebar
