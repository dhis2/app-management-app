import React from 'react';
import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';

import Sidebar from './Sidebar.component';

import CircularProgress from 'material-ui/lib/circular-progress';
import LinearProgress from 'material-ui/lib/linear-progress';

import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';

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
            this.setState({installedApps: installedApps, installing: false});
            this.setState({lastUpdate: new Date()});
        }));

        this.subscriptions.push(this.props.appStore.subscribe(appStore => {
            this.setState({appStore: appStore});
        }));

        this.subscriptions.push(actions.installApp.subscribe(() => {
            this.setState({uploading: true});
        }));

        // Automagically switch to the installed apps section when installing an app from the app store
        this.subscriptions.push(actions.installAppVersion.subscribe(() => {
            this.setState({installing: true});
            this.setSection('installed');
        }));

        this.subscriptions.push(actions.openAppStore.subscribe(() => {
            this.setSection('store');
        }));

        setTimeout(() => {
            this.setState({mountSection: false});
        }, 150);
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
                marginTop: 16,
                padding: 16,
                float: 'left',
            },
        };
        const className = 'transition-mount transition-unmount' +
            (this.state.mountSection ? ' transition-mount-active' : '') +
            (this.state.unmountSection ? ' transition-unmount-active' : '');

        if (key === 'store') {
            return (
                <div className="content-area">
                    <AppStore appStore={this.state.appStore} transitionUnmount={this.state.unmountSection}/>
                </div>
            );
        }

        return (
            <div className="content-area">
                <AppList installedApps={this.state.installedApps} uploadProgress={this.progress} transitionUnmount={this.state.unmountSection}/>
                {this.state.installing ? (
                    <Card style={styles.installing} className={'card card-up ' + className}>
                        <CardText>
                            <CircularProgress
                                mode="indeterminate"
                                color="#6688AA"
                                value={this.state.progress}/>
                            <br/>
                            <br/>
                            {d2.i18n.getTranslation('installing')}
                        </CardText>
                    </Card>
                ) : undefined}
                {this.state.uploading ? (
                    <Card style={styles.progress} className={'card card-up ' + className}>
                        <CardText>
                            {d2.i18n.getTranslation('uploading')}
                            <LinearProgress
                                mode={this.state.progress ? 'determinate' : 'indeterminate'}
                                color="#6688AA"
                                value={this.state.progress}/>
                        </CardText>
                    </Card>
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

        return (
            <div className="app">
                <HeaderBar lastUpdate={this.state.lastUpdate}/>
                <Sidebar sections={sections} currentSection={this.state.section} onChangeSection={this.setSection}/>
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
});
