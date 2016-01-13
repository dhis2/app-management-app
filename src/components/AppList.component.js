import React from 'react';

import FlatButton from 'material-ui/lib/flat-button';

import actions from '../actions';

export default React.createClass({
    propTypes: {
        installedApps: React.PropTypes.array.isRequired,
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    render() {
        const d2 = this.context.d2;
        const styles = {
            container: {
                borderBottom: '1px solid #c1c1c1',
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
                padding: '1rem',
                margin: '1rem 0 1rem 0',
                border: '1px solid #c3c3c3',
                borderRadius: 3,
                clear: 'both',
            },
        };
        return (
            <div>
                <div style={styles.upload}>{d2.i18n.getTranslation('upload_app_package')}: <input type="file" onChange={this.upload}/></div>
                {this.props.installedApps.length === 0 ? (
                    <div style={styles.upload}>
                        <p>{d2.i18n.getTranslation('there_are_no_apps_installed')}</p>
                    </div>
                ) : (
                    <div style={styles.container}>
                        {this.props.installedApps.map(app => {
                            return (
                                <div key={app.folderName} style={styles.app}>
                                    <div style={styles.appName}>
                                        <a href={app.launchUrl} target="_blank" style={styles.appLink}>{app.name} v{app.version}</a>
                                        <div style={styles.appActions}>
                                            <FlatButton style={styles.appButtons} label={d2.i18n.getTranslation('open')} secondary onClick={this.open.bind(this, app.launchUrl)}/>
                                            <FlatButton style={styles.appButtons} label={d2.i18n.getTranslation('uninstall')} onClick={this.uninstall.bind(this, app.folderName)}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
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
        actions.installApp(e.target.files[0]);
    },
});
