import React from 'react';

import Avatar from 'material-ui/lib/avatar';
import IconButton from 'material-ui/lib/icon-button';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import MenuItem from 'material-ui/lib/menus/menu-item';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';

import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';

import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FontIcon from 'material-ui/lib/font-icon';

import actions from '../actions';

export default React.createClass({
    propTypes: {
        installedApps: React.PropTypes.array.isRequired,
        uploadProgress: React.PropTypes.func,
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    componentDidMount() {
        actions.installApp.subscribe(() => {
            this.refs.fileForm.reset();
        });
    },

    render() {
        const d2 = this.context.d2;
        const styles = {
            container: {
                borderBottom: '1px solid #c1c1c1',
                paddingBottom: 0,
            },
            fab: {
                position: 'fixed',
                left: 0,
                bottom: 16,
                right: 16,
                maxWidth: 1200,
                textAlign: 'right',
            },
            noApps: {
                padding: '1rem 0',
            },
            app: {
                borderTop: '1px solid #c1c1c1',
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
            upload: {
                padding: '1rem 0',
                margin: '1rem 0 1rem 0',
                //border: '1px solid #c3c3c3',
                borderRadius: 3,
                clear: 'both',
            },
        };

        return (
            <div>
                {this.props.installedApps.length === 0 ? (
                    <div style={styles.noApps}>
                        <p>{d2.i18n.getTranslation('no_apps_installed')}</p>
                    </div>
                ) : (
                    <List style={styles.container}>
                        {this.props.installedApps.map(app => {
                            return (
                                <ListItem key={app.folderName}
                                          primaryText={app.name} secondaryText={'v' + app.version}
                                          style={styles.app}
                                          onTouchTap={this.open.bind(this, app.launchUrl)}
                                          leftAvatar={<Avatar src={[app.baseUrl, app.folderName, app.icons['48']].join('/')} />}
                                          rightIconButton={
                                          <IconMenu iconButtonElement={<IconButton><MoreVertIcon color="#808080"/></IconButton>}>
                                          <MenuItem onClick={this.uninstall.bind(this, app.folderName)}>Uninstall</MenuItem>
                                          </IconMenu>
                                          }/>
                            );

                            return (
                                <div key={app.folderName} style={styles.app}>
                                    <div style={styles.appName}>
                                        <a href={app.launchUrl} target="_blank" style={styles.appLink}>{app.name}
                                            v{app.version}</a>
                                        <div style={styles.appActions}>
                                            <FlatButton style={styles.appButtons} label={d2.i18n.getTranslation('open')}
                                                        secondary onClick={this.open.bind(this, app.launchUrl)}/>
                                            <FlatButton style={styles.appButtons}
                                                        label={d2.i18n.getTranslation('uninstall')}
                                                        onClick={this.uninstall.bind(this, app.folderName)}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </List>
                )}
                <div style={styles.upload}>
                    <div style={styles.fab}>
                        <FloatingActionButton onClick={this.newAction} onClick={(e) => { this.refs.fileInput.click(e); }}>
                            <FontIcon className="material-icons">file_upload</FontIcon>
                        </FloatingActionButton>
                    </div>
                    <form ref="fileForm" style={{visibility: 'hidden'}}><input type="file" ref="fileInput" onChange={this.upload}/></form>
                </div>
            </div>
        );
    },

    open(url) {
        window.open(url);
    },

    uninstall(appKey) {
        actions.uninstallApp(appKey);
    },

    reloadApps() {
        actions.refreshApps();
    },

    upload(e) {
        actions.installApp(e.target.files[0], this.props.uploadProgress);
    },
});
