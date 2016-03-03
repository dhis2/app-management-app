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


// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default React.createClass({
    propTypes: {
        installedApps: React.PropTypes.array.isRequired,
        uploadProgress: React.PropTypes.func.isRequired,
        transitionUnmount: React.PropTypes.bool.isRequired,
        showUpload: React.PropTypes.bool.isRequired,
        appStore: React.PropTypes.object.isRequired,
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    getInitialState() {
        return {
            componentDidMount: false,
            uploading: false,
        };
    },

    componentDidMount() {
        setTimeout(() => {
            this.setState({ componentDidMount: true });
        }, 0);

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

    openStore() {
        actions.navigateToSection('store');
    },

    // What's wrong with a little complexity?
    // No seriously this function is a mess..
    // TODO: Separate out renderInstalledApps()
    /* eslint-disable complexity */
    render() {
        const d2 = this.context.d2;
        const styles = {
            header: {
                fontSize: 24,
                fontWeight: 100,
                color: AppTheme.rawTheme.palette.textColor,
                padding: '16px 0 5px 16px',
            },
            container: {
                borderBottom: '1px solid #dddddd',
                paddingBottom: 0,
                marginBottom: 8,
            },
            fab: {
                position: 'fixed',
                left: 0,
                bottom: 16,
                right: 16,
                maxWidth: 1200,
                textAlign: 'right',
            },
            fabAnim: {
                float: 'right',
            },
            noApps: {
                marginTop: 16,
                textAlign: 'center',
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
            upload: {},
            card: {
                marginTop: 8,
                marginRight: '1rem',
            },
        };
        const baseUrl = d2.Api.getApi().baseUrl;
        const setFormRef = (ref) => { this.form = ref; };

        const className = `transition-mount transition-unmount
            ${(this.state.componentDidMount ? '' : ' transition-mount-active')}
            ${(this.props.transitionUnmount || !this.props.showUpload ? ' transition-unmount-active' : '')}`;

        return (
            <div>
                {this.props.installedApps.length === 0 ? (
                    <div style={{ marginTop: 64 }}>
                        <div style={styles.noApps}>{d2.i18n.getTranslation('no_apps_installed')}</div>
                        {this.props.appStore.name ? (
                            <div style={styles.noApps}>
                                <a href="#" onClick={this.openStore}>
                                    <i className="material-icons" style={{ verticalAlign: 'bottom' }}>store</i>
                                    {this.props.appStore.name}
                                </a>
                            </div>
                        ) : undefined}
                    </div>
                ) : (
                    <div>
                        <div style={styles.header}>{d2.i18n.getTranslation('installed_applications')}</div>
                        <Card style={styles.card}>
                            <CardText>
                                <List style={styles.container}>{
                                    this.props.installedApps.map(app => {
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
                    </div>
                )}
                <div style={styles.upload}>
                    <div style={styles.fab}>
                        <div style={styles.fabAnim} className={`fab ${className}`}>
                            <FloatingActionButton onClick={this.uploadAction}>
                                <FontIcon className="material-icons">file_upload</FontIcon>
                            </FloatingActionButton>
                        </div>
                    </div>
                    <form ref={setFormRef} style={{ visibility: 'hidden' }}>
                        <input type="file" ref="fileInput" onChange={this.upload} />
                    </form>
                </div>
            </div>
        );
    },
});
