import React from 'react';

import Avatar from 'material-ui/lib/avatar';
import IconButton from 'material-ui/lib/icon-button';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import MenuItem from 'material-ui/lib/menus/menu-item';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';

import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';

import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FontIcon from 'material-ui/lib/font-icon';

import AppTheme from '../theme';
import actions from '../actions';


const styles = {
    wrapper: {
        maxWidth: 750,
        position: 'relative',
    },
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: AppTheme.rawTheme.palette.textColor,
        padding: '16px 0 5px 16px',
    },
    container: {
        borderBottom: '1px solid #dddddd',
        paddingBottom: 0,
        marginBottom: 8,
    },
    fab: {
        position: 'absolute',
        top: 28,
        right: 28,
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
export default React.createClass({
    propTypes: {
        installedApps: React.PropTypes.array.isRequired,
        uploadProgress: React.PropTypes.func.isRequired,
        showUpload: React.PropTypes.bool.isRequired,
        appStore: React.PropTypes.object.isRequired,
        appTypeFilter: React.PropTypes.oneOf(['APP', 'DASHBOARD_WIDGET', 'TRACKER_DASHBOARD_WIDGET', 'RESOURCE']),
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    getInitialState() {
        return { uploading: false };
    },

    componentDidMount() {
        actions.installApp.subscribe(() => {
            if (this.form) {
                this.form.reset();
            }
        });
    },

    uploadAction(e) {
        this.refs.fileInput.click(e);
    },

    upload(e) {
        actions.installApp(e.target.files[0], this.props.uploadProgress);
    },

    renderInstalledApps() {
        const d2 = this.context.d2;
        const baseUrl = d2.Api.getApi().baseUrl;
        const label = (this.props.appTypeFilter
            ? `${this.props.appTypeFilter}_apps`
            : 'app_apps').toLocaleLowerCase();
        const appList = this.props.installedApps
            .filter(app => !this.props.appTypeFilter || app.appType === this.props.appTypeFilter);

        if (appList.length > 0) {
            return (
                <div>
                    <div style={styles.header}>{d2.i18n.getTranslation(label)}</div>
                    <Card style={styles.card}>
                        <CardText>
                            <List style={styles.container}>{
                                appList.map(app => {
                                    const uninstall = actions.uninstallApp.bind(null, app.folderName);
                                    const moreIcon = <IconButton><MoreVertIcon color="#808080" /></IconButton>;
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
                                            src={[baseUrl, 'apps', app.folderName, app.icons['48']].join('/')}
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
                                            primaryText={app.name} secondaryText={`v${app.version}`}
                                            style={styles.app}
                                            onTouchTap={open}
                                            leftAvatar={avatar}
                                            rightIconButton={rightIconButton}
                                        />
                                    );
                                })
                            }</List>
                        </CardText>
                    </Card>
                    { this.renderUploadButton() }
                </div>
            );
        }

        return this.renderEmptyList();
    },

    renderEmptyList() {
        const d2 = this.context.d2;
        const labelHeader = (this.props.appTypeFilter
            ? `${this.props.appTypeFilter}_apps`
            : 'app_apps').toLocaleLowerCase();
        const labelNoApps = (this.props.appTypeFilter
            ? `no_${this.props.appTypeFilter}_apps_installed`
            : 'no_apps_installed').toLowerCase();

        return (
            <div>
                <div style={styles.header}>{d2.i18n.getTranslation(labelHeader)}</div>
                <div style={styles.noApps}>{d2.i18n.getTranslation(labelNoApps)}</div>
                { this.renderUploadButton() }
            </div>
        );
    },

    renderUploadButton() {
        if (!this.props.showUpload) {
            return null;
        }

        const setFormRef = (ref) => {
            this.form = ref;
        };

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
                    <input type="file" ref="fileInput" onChange={this.upload} />
                </form>
            </div>
        );
    },

    render() {
        return (
            <div style={styles.wrapper}>
                { this.renderInstalledApps() }
            </div>
        );
    },
});
