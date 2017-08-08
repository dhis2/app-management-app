import React from 'react';

import HeaderBarComponent from 'd2-ui/lib/app-header/HeaderBar';
import headerBarStore$ from 'd2-ui/lib/app-header/headerBar.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';

import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';

import { Card, CardText } from 'material-ui/Card';
import Snackbar from 'material-ui/Snackbar';
import FontIcon from 'material-ui/FontIcon';

import AppList from './AppList.component';
import AppStore from './AppStore.component';
import AppTheme from '../theme';

import actions from '../actions';
import appStoreStore from '../stores/appStore.store';
import installedAppStore from '../stores/installedApp.store';


const HeaderBar = withStateFrom(headerBarStore$, HeaderBarComponent);

const styles = {
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: AppTheme.rawTheme.palette.textColor,
        padding: '24px 0 12px 16px',
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
        maxWidth: 734,
    },
    installing: {
        marginRight: '1rem',
        paddingRight: '1rem',
        marginTop: 16,
        padding: 16,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 300,
        maxWidth: 734,
    },
    snackbar: {
        // left: '2rem',
        right: 'initial',
    },
    menuLabel: {
        position: 'relative',
        top: -6,
        marginLeft: 16,
    },
};


class App extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            installedApps: [],
            installing: false,
            uploading: false,
            progress: undefined,
            appStore: {},
            lastUpdate: null,
        };

        // Bind 'this' for functions that need it
        ['setSection', 'progress', 'closeSnackbar', 'showSnackbar', 'search']
            .forEach((fn) => { this[fn] = this[fn].bind(this); });
    }

    getChildContext() {
        return {
            d2: this.props.d2,
            muiTheme: AppTheme,
        };
    }

    componentDidMount() {
        this.subscriptions = [
            installedAppStore.subscribe((installedApps) => {
                this.setState({ installedApps, lastUpdate: new Date() });
            }),
            appStoreStore.subscribe((appStore) => {
                this.setState({ appStore, installing: appStore.installing !== undefined && appStore.installing > 0 });
            }),

            actions.installApp.subscribe(() => {
                this.setState({ uploading: true });
            }),
            actions.appInstalled.subscribe(({ data }) => {
                this.setState({ uploading: false });
                this.setSection(installedAppStore.getAppFromKey(data).appType.toLowerCase() || 'app');
            }),
            actions.refreshApps.subscribe(() => {
                this.setState({ uploading: false });
            }),
            actions.showSnackbarMessage.subscribe((params) => {
                if (this.state.snackbar) {
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
                this.setSection((app.appType && app.appType.toLowerCase()) || 'app');
            }),
        ];

        actions.loadAppStore();
    }

    componentWillUnmount() {
        this.subscriptions.forEach((subscription) => {
            subscription.dispose();
        });
    }

    setSection(key) {
        if (this.sidebar) {
            this.sidebar.clearSearchBox();
        }
        this.setState({ section: key, appSearch: undefined });
    }

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
    }

    closeSnackbar() {
        this.setState({ snackbar: undefined });
    }

    showSnackbar(message) {
        this.setState({ snackbar: message });
    }

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
    }

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
    }

    renderInstallProgress() {
        if (this.state.installing) {
            const d2 = this.props.d2;
            return (
                <div style={styles.installing}>
                    <CircularProgress
                        mode="indeterminate"
                        color="#6688AA"
                        // size={0.75}
                        value={this.state.progress}
                    />
                    <br /><br />
                    {d2.i18n.getTranslation('installing')}
                </div>
            );
        }

        return null;
    }

    renderSection(key, apps, showUpload) {
        if (key === 'store') {
            return <AppStore appStore={this.state.appStore} />;
        }

        const filter = (key && key.toString().toUpperCase()) || 'APP';

        return (
            <AppList
                installedApps={apps}
                uploadProgress={this.progress}
                transitionUnmount={this.state.unmountSection}
                showUpload={showUpload && !this.state.uploading}
                appStore={this.state.appStore}
                appTypeFilter={filter}
            />
        );
    }

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
            return Object.keys(appsByType).map((type, i) => (
                <div key={type}>{
                    this.renderSection(type, appsByType[type], i === 0)
                }</div>
            ));
        }

        return (
            <div>
                <div style={styles.header}>{d2.i18n.getTranslation('no_apps_found')}</div>
                <div style={styles.noApps}>
                    {d2.i18n.getTranslation('no_installed_apps_matched')} &quot;{this.state.appSearchText}&quot;
                </div>
            </div>
        );
    }

    render() {
        const d2 = this.props.d2;
        const sections = [
            {
                key: 'app',
                icon: 'desktop_windows',
                label: d2.i18n.getTranslation('app_apps'),
            }, {
                key: 'dashboard_widget',
                icon: 'wallpaper',
                label: d2.i18n.getTranslation('dashboard_widget_apps'),
            }, {
                key: 'tracker_dashboard_widget',
                icon: 'supervisor_account',
                label: d2.i18n.getTranslation('tracker_dashboard_widget_apps'),
            }, {
                key: 'resource',
                icon: 'data_usage',
                label: d2.i18n.getTranslation('resource_apps'),
            }, {
                key: 'store',
                icon: 'store',
                label: d2.i18n.getTranslation('app_store'),
            },
        ].map(section => ({
            key: section.key,
            label: section.label,
            icon: <FontIcon className="material-icons">{section.icon}</FontIcon>,
        }));

        const reffer = (r) => { this.sidebar = r; };

        return (
            <div className="app">
                <HeaderBar lastUpdate={this.state.lastUpdate} />
                <Sidebar
                    sections={sections}
                    currentSection={this.state.section}
                    onChangeSection={this.setSection}
                    showSearchField
                    onChangeSearchText={this.search}
                    ref={reffer}
                />
                <Snackbar
                    message={this.state.snackbar || ''}
                    autoHideDuration={2500}
                    onRequestClose={this.closeSnackbar}
                    open={!!this.state.snackbar}
                    style={styles.snackbar}
                />
                <div className="content-area">
                    {this.state.appSearch
                        ? this.renderSearchResults()
                        : this.renderSection(this.state.section, this.state.installedApps, true)
                    }
                    {this.renderUploadProgress()}
                    {this.renderInstallProgress()}
                </div>
            </div>
        );
    }
}
App.propTypes = {
    d2: React.PropTypes.object.isRequired,
};

App.childContextTypes = {
    d2: React.PropTypes.object,
    muiTheme: React.PropTypes.object,
};

export default App;
