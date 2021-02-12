import React from 'react'
import PropTypes from 'prop-types'

import Avatar from 'material-ui/Avatar'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import { List, ListItem } from 'material-ui/List'
import MenuItem from 'material-ui/MenuItem'
import { Card, CardText } from 'material-ui/Card'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FontIcon from 'material-ui/FontIcon'

import { Chip } from '@dhis2/ui'

import AppTheme from '../theme'
import actions from '../actions'
import latestAppVersion from '../latest-app-version'

import i18n from '@dhis2/d2-i18n'

const appTypeHeaders = {
    bundled_app: 'Installed Bundled Apps',
    app: 'Installed Standard Apps',
    dashboard_widget: 'Installed Dashboard Apps',
    tracker_dashboard_widget: 'Installed Tracker Dashboard Apps',
    resource: 'Installed Resource Apps',
}

const appTypeMissing = {
    bundled_app: 'There are no bundled apps installed.',
    app: 'There are no standard apps installed.',
    dashboard_widget: 'There are no dashboard apps installed.',
    tracker_dashboard_widget: 'There are no tracker dashboard apps installed.',
    resource: 'There are no resource apps installed',
}

const styles = {
    wrapper: {
        maxWidth: 750,
        position: 'relative',
    },
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: AppTheme.rawTheme.palette.textColor,
        padding: '24px 0 12px 16px',
    },
    container: {
        borderBottom: '1px solid #dddddd',
        paddingBottom: 0,
        marginBottom: 8,
    },
    fab: {
        position: 'absolute',
        top: 45,
        right: 32,
    },
    fabAnim: {
        float: 'right',
    },
    noApps: {
        marginTop: 16,
        padding: '16px 0 5px 16px',
        fontWeight: 300,
        fontSize: 15,
    },
    app: {
        borderTop: '1px solid #dddddd',
    },
    appName: {
        padding: 16,
        clear: 'both',
    },
    appLink: {
        textDecoration: 'none',
    },
    appActions: {
        display: 'inline-block',
        float: 'right',
        marginTop: -8,
        marginRight: -16,
    },
    appButtons: {
        marginLeft: '1rem',
    },
    appIcon: {
        borderRadius: 3,
    },
    card: {
        marginTop: 8,
        marginRight: '1rem',
    },
    coreAppLabel: {
        fontWeight: 'bold',
        marginRight: '0.3em',
    },
}

const AppItem = ({ app, appVersions }) => {
    const latestVersion = latestAppVersion(appVersions)
    const needsUpdate =
        latestVersion !== null && latestVersion.version != app.version
    const handleUpdate = async event => {
        event.stopPropagation()
        await actions.installAppVersion(latestVersion.id).toPromise()
        if (app.name === 'App Management') {
            setTimeout(() => location.reload(), 500)
        }
    }
    const handleUninstall = () => actions.uninstallApp(app.key)
    const handleOpen = () => window.open(app.launchUrl)
    const moreIcon = (
        <IconButton>
            <FontIcon className="material-icons" color="#808080">
                more_vert
            </FontIcon>
        </IconButton>
    )
    const rightIconButton = (
        <IconMenu iconButtonElement={moreIcon}>
            {needsUpdate && (
                <MenuItem onClick={handleUpdate}>
                    Update to v{latestVersion.version}
                </MenuItem>
            )}
            <MenuItem onClick={handleUninstall}>Uninstall</MenuItem>
        </IconMenu>
    )
    const avatar = app.icons?.['48'] ? (
        <Avatar
            style={styles.appIcon}
            src={[app.baseUrl, app.icons['48']].join('/')}
        />
    ) : (
        <Avatar
            backgroundColor={AppTheme.rawTheme.palette.primary1Color}
            icon={<FontIcon className="material-icons">folder</FontIcon>}
        />
    )
    const primaryText = (
        <div>
            {app.name}
            {needsUpdate && (
                <Chip onClick={(_, e) => handleUpdate(e)} dense>
                    Update to v{latestVersion.version}
                </Chip>
            )}
        </div>
    )
    const secondaryText = (
        <div>
            {app.isBundledApp && (
                <span style={styles.coreAppLabel}>{i18n.t('CORE APP')}</span>
            )}
            {`v${app.version}`}
        </div>
    )

    return (
        <ListItem
            primaryText={primaryText}
            secondaryText={secondaryText}
            style={styles.app}
            onClick={handleOpen}
            leftAvatar={avatar}
            rightIconButton={rightIconButton}
        />
    )
}
AppItem.propTypes = {
    app: PropTypes.object.isRequired,
    appVersions: PropTypes.array,
}

class AppList extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            uploading: false,
        }
    }

    componentDidMount() {
        actions.installApp.subscribe(() => {
            if (this.form) {
                this.form.reset()
            }
        })
    }

    uploadAction = e => {
        this.fileInput.click(e)
    }

    upload = e => {
        actions.installApp(e.target.files[0], this.props.uploadProgress)
    }

    appVersions = app => {
        if (!this.props.appHub.apps) {
            return null
        }

        const appHubData = this.props.appHub.apps.find(
            appHubApp =>
                appHubApp.name === app.name &&
                (!app.developer ||
                    appHubApp.developer.name == app.developer?.name ||
                    appHubApp.developer.organisation == app.developer?.name)
        )
        return appHubData?.versions
    }

    renderInstalledApps() {
        const label = this.props.appTypeFilter.toLocaleLowerCase()
        const appList = this.props.installedApps.filter(
            app =>
                !this.props.appTypeFilter ||
                (this.props.appTypeFilter === 'BUNDLED_APP' &&
                    app.isBundledApp) ||
                app.appType === this.props.appTypeFilter
        )

        if (appList.length > 0) {
            return (
                <div>
                    <div style={styles.header}>
                        {i18n.t(appTypeHeaders[label])}
                    </div>
                    <Card style={styles.card}>
                        <CardText>
                            <List style={styles.container}>
                                {appList.map(app => (
                                    <AppItem
                                        key={app.folderName}
                                        app={app}
                                        appVersions={this.appVersions(app)}
                                    />
                                ))}
                            </List>
                        </CardText>
                    </Card>
                    {this.renderUploadButton()}
                </div>
            )
        }

        return this.renderEmptyList()
    }

    renderEmptyList() {
        const label = this.props.appTypeFilter.toLocaleLowerCase()

        return (
            <div>
                <div style={styles.header}>{i18n.t(appTypeHeaders[label])}</div>
                <div style={styles.noApps}>{i18n.t(appTypeMissing[label])}</div>
                {this.renderUploadButton()}
            </div>
        )
    }

    renderUploadButton() {
        if (!this.props.showUpload) {
            return null
        }

        const setFormRef = ref => {
            this.form = ref
        }

        const theref = r => {
            this.fileInput = r
        }

        return (
            <div>
                <div style={styles.fab}>
                    <div style={styles.fabAnim} className="fab">
                        <FloatingActionButton onClick={this.uploadAction}>
                            <FontIcon className="material-icons">
                                file_upload
                            </FontIcon>
                        </FloatingActionButton>
                    </div>
                </div>
                <form ref={setFormRef} style={{ visibility: 'hidden' }}>
                    <input type="file" ref={theref} onChange={this.upload} />
                </form>
            </div>
        )
    }

    render() {
        return <div style={styles.wrapper}>{this.renderInstalledApps()}</div>
    }
}
AppList.propTypes = {
    appHub: PropTypes.object.isRequired,
    appTypeFilter: PropTypes.oneOf([
        'BUNDLED_APP',
        'APP',
        'DASHBOARD_WIDGET',
        'TRACKER_DASHBOARD_WIDGET',
        'RESOURCE',
    ]).isRequired,
    installedApps: PropTypes.array.isRequired,
    showUpload: PropTypes.bool.isRequired,
    uploadProgress: PropTypes.func.isRequired,
}
AppList.defaultProps = {
    appTypeFilter: 'app',
}

export default AppList
