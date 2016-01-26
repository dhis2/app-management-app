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


export default React.createClass({
    propTypes: {
        d2: React.PropTypes.object.isRequired,
        installedApps: React.PropTypes.object.isRequired,
        appStore: React.PropTypes.object.isRequired,
    },

    childContextTypes: {
        d2: React.PropTypes.object,
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            d2: this.props.d2,
            muiTheme: AppTheme,
        };
    },

    getInitialState() {
        return {
            installedApps: [],
            installing: false,
            uploading: false,
            progress: undefined,
            appStore: {},
            lastUpdate: null,
            mountSection: true,
            unmountSection: false,
        };
    },

    componentDidMount() {
        this.subscriptions = [];
        this.subscriptions.push(this.props.installedApps.subscribe(installedApps => {
            this.setState({installedApps: installedApps, lastUpdate: new Date()});
        }));

        this.subscriptions.push(this.props.appStore.subscribe(appStore => {
            this.setState({
                appStore: appStore,
                installing: appStore.installing !== undefined && appStore.installing > 0,
            });
        }));

        this.subscriptions.push(actions.installApp.subscribe(() => {
            this.setState({uploading: true});
        }));

        this.subscriptions.push(actions.showSnackbarMessage.subscribe(params => {
            if (!!this.state.snackbar) {
                this.setState({snackbar: undefined});
                setTimeout(() => {
                    this.setState({snackbar: params.data});
                }, 150);
            } else {
                this.setState({snackbar: params.data});
            }
        }));

        // Automagically switch to the installed apps section when installing an app from the app store
        this.subscriptions.push(actions.installAppVersion.subscribe(() => {
            this.setSection('installed');
        }));

        actions.loadAppStore();

        setTimeout(() => {
            this.setState({mountSection: false});
        }, 0);
    },

    componentWillUnmount() {
        this.subscriptions.forEach(subscription => {
            subscription.dispose();
        });
    },

    renderSection(key) {
        const d2 = this.props.d2;
        const styles = {
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
        };

        if (key === 'store') {
            return (
                <div className="content-area">
                    <AppStore appStore={this.state.appStore}/>
                </div>
            );
        }

        return (
            <div className="content-area">
                <AppList installedApps={this.state.installedApps} uploadProgress={this.progress}
                         transitionUnmount={this.state.unmountSection} showUpload={!this.state.uploading}/>
                {this.state.uploading ? (
                    <Card style={styles.progress}>
                        <CardText>
                            {d2.i18n.getTranslation('uploading')}
                            <LinearProgress
                                mode={this.state.progress ? 'determinate' : 'indeterminate'}
                                color="#6688AA"
                                value={this.state.progress}/>
                        </CardText>
                    </Card>
                ) : undefined}
                {this.state.installing ? (
                    <div style={styles.installing}>
                        <CircularProgress
                            mode="indeterminate"
                            color="#6688AA"
                            size={0.75}
                            value={this.state.progress}/>
                        <br/><br/>
                        {d2.i18n.getTranslation('installing')}
                    </div>
                ) : undefined}
            </div>
        );
    },

    render() {
        const d2 = this.props.d2;
        const sections = [
            {key: 'installed', label: d2.i18n.getTranslation('installed_apps')},
            {key: 'store', label: d2.i18n.getTranslation('app_store')},
        ];
        const styles = {
            snackbar: {
                left: '2rem',
                right: 'initial',
            },
        };

        return (
            <div className="app">
                <HeaderBar lastUpdate={this.state.lastUpdate}/>
                <Sidebar sections={sections} currentSection={this.state.section} onChangeSection={this.setSection}/>
                <Snackbar message={this.state.snackbar || ''} autoHideDuration={1250}
                          onRequestClose={this.closeSnackbar} open={!!this.state.snackbar} style={styles.snackbar}/>
                {this.renderSection(this.state.section)}
            </div>
        );
    },

    progress(p) {
        if (p) {
            if (p === 1) {
                this.setState({uploading: false, progress: undefined});
            } else {
                this.setState({progress: p * 100});
            }
        } else {
            this.setState({progress: undefined});
        }
    },

    reloadInstalledApps() {
        actions.refreshApps();
    },

    setSection(key) {
        this.setState({unmountSection: true});
        setTimeout(() => {
            this.setState({unmountSection: false, mountSection: true, section: key});
            setTimeout(() => {
                this.setState({mountSection: false});
            }, 150);
        }, 150);
    },

    closeSnackbar() {
        this.setState({snackbar: undefined});
    },

    showSnackbar(message) {
        this.setState({snackbar: message});
    },
});
