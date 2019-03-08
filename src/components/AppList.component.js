/* global  window */
import React from 'react';

import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import { List, ListItem } from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';

import { Card, CardText } from 'material-ui/Card';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon';

import AppTheme from '../theme';
import actions from '../actions';

import i18n from '@dhis2/d2-i18n'

const appTypeLabels = {
    'app': 'Standard Apps',
    'dashboard_widget': 'Dashboard Apps',
    'tracker_dashboard_widget': 'Tracker Dashboard Apps',
    'resource': 'Resource Apps',
}

const appTypeHeaders = {
    'app': 'Installed Standard Apps',
    'dashboard_widget': 'Installed Dashboard Apps',
    'tracker_dashboard_widget': 'Installed Tracker Dashboard Apps',
    'resource': 'Installed Resource Apps',
}

const appTypeMissing = {
    'app': 'There are no standard apps installed.',
    'dashboard_widget': 'There are no dashboard apps installed.',
    'tracker_dashboard_widget': 'There are no tracker dashboard apps installed.',
    'resource': 'There are no resource apps installed',
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
};

// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
class AppList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            uploading: false,
        };

        this.uploadAction = this.uploadAction.bind(this);
        this.upload = this.upload.bind(this);
    }

    componentDidMount() {
        actions.installApp.subscribe(() => {
            if (this.form) {
                this.form.reset();
            }
        });
    }

    uploadAction(e) {
        this.fileInput.click(e);
    }

    upload(e) {
        actions.installApp(e.target.files[0], this.props.uploadProgress);
    }

    renderInstalledApps() {
        const d2 = this.context.d2;
        const baseUrl = d2.Api.getApi().baseUrl;
        const label = this.props.appTypeFilter.toLocaleLowerCase();
        const appList = this.props.installedApps
            .filter(app => !this.props.appTypeFilter || app.appType === this.props.appTypeFilter);

        if (appList.length > 0) {
            return (
                <div>
                    <div style={styles.header}>{i18n.t(appTypeHeaders[label])}</div>
                    <Card style={styles.card}>
                        <CardText>
                            <List style={styles.container}>{
                                appList.map((app) => {
                                    const uninstall = actions.uninstallApp.bind(null, app.key);
                                    const moreIcon = (
                                        <IconButton>
                                            <FontIcon className="material-icons" color="#808080">more_vert</FontIcon>
                                        </IconButton>
                                    );
                                    const open = window.open.bind(null, app.launchUrl);
                                    const rightIconButton = (
                                        <IconMenu iconButtonElement={moreIcon}>
                                            <MenuItem onClick={uninstall}>
                                                Uninstall
                                            </MenuItem>
                                        </IconMenu>
                                    );
                                    const avatar = app.icons && app.icons['48'] ? (
                                        <Avatar
                                            style={styles.appIcon}
                                            src={[baseUrl, 'apps', app.key, app.icons['48']].join('/')}
                                        />
                                    ) : (
                                        <Avatar
                                            backgroundColor={AppTheme.rawTheme.palette.primary1Color}
                                            icon={<FontIcon className="material-icons">folder</FontIcon>}
                                        />
                                    );
                                    return (
                                        <ListItem
                                            key={app.folderName}
                                            primaryText={app.name}
                                            secondaryText={`v${app.version}`}
                                            style={styles.app}
                                            onClick={open}
                                            leftAvatar={avatar}
                                            rightIconButton={rightIconButton}
                                        />
                                    );
                                })
                            }</List>
                        </CardText>
                    </Card>
                    {this.renderUploadButton()}
                </div>
            );
        }

        return this.renderEmptyList();
    }

    renderEmptyList() {
        const d2 = this.context.d2;

        const label = this.props.appTypeFilter.toLocaleLowerCase();

        return (
            <div>
                <div style={styles.header}>{i18n.t(appTypeHeaders[label])}</div>
                <div style={styles.noApps}>{i18n.t(appTypeMissing[label])}</div>
                {this.renderUploadButton()}
            </div>
        );
    }

    renderUploadButton() {
        if (!this.props.showUpload) {
            return null;
        }

        const setFormRef = (ref) => {
            this.form = ref;
        };

        const theref = (r) => { this.fileInput = r; };

        return (
            <div>
                <div style={styles.fab}>
                    <div style={styles.fabAnim} className="fab">
                        <FloatingActionButton onClick={this.uploadAction}>
                            <FontIcon className="material-icons">file_upload</FontIcon>
                        </FloatingActionButton>
                    </div>
                </div>
                <form ref={setFormRef} style={{ visibility: 'hidden' }}>
                    <input type="file" ref={theref} onChange={this.upload} />
                </form>
            </div>
        );
    }

    render() {
        return (
            <div style={styles.wrapper}>
                {this.renderInstalledApps()}
            </div>
        );
    }
}
AppList.propTypes = {
    installedApps: React.PropTypes.array.isRequired,
    uploadProgress: React.PropTypes.func.isRequired,
    showUpload: React.PropTypes.bool.isRequired,
    appTypeFilter: React.PropTypes.oneOf(['APP', 'DASHBOARD_WIDGET', 'TRACKER_DASHBOARD_WIDGET', 'RESOURCE']),
};
AppList.defaultProps = {
    appTypeFilter: 'app',
};

AppList.contextTypes = {
    d2: React.PropTypes.object,
};


export default AppList;
