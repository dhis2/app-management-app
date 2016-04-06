import React from 'react';
import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';

import CircularProgress from 'material-ui/lib/circular-progress';
import LinearProgress from 'material-ui/lib/linear-progress';

import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';
import Snackbar from 'material-ui/lib/snackbar';

import AppList from './AppList.component';
import AppStore from './AppStore.component';
import AppTheme from '../theme';

import actions from '../actions';
import appStoreStore from '../stores/appStore.store';
import installedAppStore from '../stores/installedApp.store';


const styles = {
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: AppTheme.rawTheme.palette.textColor,
        padding: '16px 0 5px 16px',
    },
    noApps: {
        marginTop: 16,
        padding: '16px 0 5px 16px',
        fontWeight: 300,
        fontSize: 15,
    },
    progress: {
        margin: '16px 1rem 16px 0',
        padding: 16,
    },
    installing: {
        marginRight: '1rem',
        paddingRight: '1rem',
        marginTop: 16,
        padding: 16,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 100,
    },
    snackbar: {
        left: '2rem',
        right: 'initial',
    },
};


// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default React.createClass({
    propTypes: {
        d2: React.PropTypes.object.isRequired,
    },

    childContextTypes: {
        d2: React.PropTypes.object,
        muiTheme: React.PropTypes.object,
    },

    getInitialState() {
        return {
            installedApps: [],
            installing: false,
            uploading: false,
            progress: undefined,
            appStore: {},
            lastUpdate: null,
        };
    },

    getChildContext() {
        return {
            d2: this.props.d2,
            muiTheme: AppTheme,
        };
    },

    componentDidMount() {
        this.subscriptions = [
            installedAppStore.subscribe(installedApps => { this.setState({ installedApps, lastUpdate: new Date() }); }),
            appStoreStore.subscribe(appStore => {
                this.setState({ appStore, installing: appStore.installing !== undefined && appStore.installing > 0 });
            }),

            actions.installApp.subscribe(() => { this.setState({ uploading: true }); }),
            actions.appInstalled.subscribe(({ data }) => {
                this.setSection(installedAppStore.getAppFromKey(data).appType.toLowerCase() || 'app');
            }),
            actions.showSnackbarMessage.subscribe(params => {
                if (!!this.state.snackbar) {
                    this.setState({ snackbar: undefined });
                    setTimeout(() => {
                        this.setState({ snackbar: params.data });
                    }, 150);
                } else {
                    this.setState({ snackbar: params.data });
                }
            }),
            actions.installAppVersion.subscribe(({ data }) => {
                const app = appStoreStore.getAppFromVersionId(data[0]);
                this.setSection(app.appType && app.appType.toLowerCase() || 'app');
            }),
        ];

        actions.loadAppStore();
    },

    componentWillUnmount() {
        this.subscriptions.forEach(subscription => {
            subscription.dispose();
        });
    },

    setSection(key) {
        this.setState({ unmountSection: true });
        setTimeout(() => {
            this.setState({ unmountSection: false, mountSection: true, section: key });
            setTimeout(() => {
                this.setState({ mountSection: false });
            }, 150);
        }, 150);
    },

    reloadInstalledApps() {
        actions.refreshApps();
    },

    progress(p) {
        if (p) {
            if (p === 1) {
                this.setState({ uploading: false, progress: undefined });
            } else {
                this.setState({ progress: p * 100 });
            }
        } else {
            this.setState({ progress: undefined });
        }
    },

    closeSnackbar() {
        this.setState({ snackbar: undefined });
    },

    showSnackbar(message) {
        this.setState({ snackbar: message });
    },

    search(text) {
        if (text.length > 0) {
            this.setState({
                appSearch: this.state.installedApps
                    .filter(app => app.name.toLowerCase().indexOf(text.toLowerCase()) !== -1)
                    .sort((a, b) => a.appType.localeCompare(b.appType) || a.name.localeCompare(b.name)),
                appSearchText: text,
            });
        } else {
            this.setState({ appSearch: undefined, appSearchText: undefined });
        }
    },

    renderUploadProgress() {
        if (this.state.uploading) {
            const d2 = this.props.d2;
            return (
                <Card style={styles.progress}>
                    <CardText>
                        {d2.i18n.getTranslation('uploading')}
                        <LinearProgress
                            mode={this.state.progress ? 'determinate' : 'indeterminate'}
                            color="#6688AA"
                            value={this.state.progress}
                        />
                    </CardText>
                </Card>
            );
        }

        return null;
    },

    renderInstallProgress() {
        if (this.state.installing) {
            const d2 = this.props.d2;
            return (
                <div style={styles.installing}>
                    <CircularProgress
                        mode="indeterminate"
                        color="#6688AA"
                        size={0.75}
                        value={this.state.progress}
                    />
                    <br /><br />
                    {d2.i18n.getTranslation('installing')}
                </div>
            );
        }

        return null;
    },

    renderSection(key, apps) {
        if (key === 'store') {
            return <AppStore appStore={this.state.appStore} />;
        }

        const filter = key && key.toString().toUpperCase() || 'APP';

        return (
            <AppList
                installedApps={apps}
                uploadProgress={this.progress}
                transitionUnmount={this.state.unmountSection}
                showUpload={!this.state.uploading}
                appStore={this.state.appStore}
                appTypeFilter={filter}
            />
        );
    },

    renderSearchResults() {
        const d2 = this.props.d2;
        const appsByType = this.state.appSearch.reduce((types, app) => {
            if (types.hasOwnProperty(app.appType)) {
                types[app.appType].push(app);
            } else {
                types[app.appType] = [app]; // eslint-disable-line
            }

            return types;
        }, {});

        if (Object.keys(appsByType).length) {
            return Object.keys(appsByType).map(type => (
                <div key={type}>{
                    this.renderSection(type, appsByType[type])
                }</div>
            ));
        }

        return (
            <div>
                <div style={styles.header}>{d2.i18n.getTranslation('no_apps_found')}</div>
                <div style={styles.noApps}>
                    {d2.i18n.getTranslation('no_installed_apps_matched')} "{this.state.appSearchText}"
                </div>
            </div>
        );
    },

    render() {
        const d2 = this.props.d2;
        const sections = [
            { key: 'app', label: d2.i18n.getTranslation('app_apps') },
            { key: 'dashboard_widget', label: d2.i18n.getTranslation('dashboard_widget_apps') },
            { key: 'tracker_dashboard_widget', label: d2.i18n.getTranslation('tracker_dashboard_widget_apps') },
            { key: 'resource', label: d2.i18n.getTranslation('resource_apps') },
            { key: 'store', label: d2.i18n.getTranslation('app_store') },
        ];

        return (
            <div className="app">
                <HeaderBar lastUpdate={this.state.lastUpdate} />
                <Sidebar
                    sections={sections}
                    currentSection={this.state.section}
                    onChangeSection={this.setSection}
                    showSearchField
                    onChangeSearchText={this.search}
                />
                <Snackbar
                    message={this.state.snackbar || ''}
                    autoHideDuration={2500}
                    onRequestClose={this.closeSnackbar}
                    open={!!this.state.snackbar}
                    style={styles.snackbar}
                />
                <div className="content-area">{
                    this.state.appSearch
                        ? this.renderSearchResults()
                        : this.renderSection(this.state.section, this.state.installedApps)
                }</div>
                {this.renderUploadProgress()}
                {this.renderInstallProgress()}
            </div>
        );
    },
});
