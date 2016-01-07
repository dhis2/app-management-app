import React from 'react';
import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';

import Sidebar from './Sidebar.component';

import CircularProgress from 'material-ui/lib/circular-progress';
import LinearProgress from 'material-ui/lib/linear-progress';

import AppCard from './AppCard.component';
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
            appStore: {
                name: this.props.d2.i18n.getTranslation('dhis2_app_store'),
            },
        };
    },

    componentDidMount() {
        this.subscriptions = [];
        this.subscriptions.push(this.props.installedApps.subscribe(installedApps => {
            this.setState({installedApps: installedApps, installing: false, uploading: false});
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
            this.setCategory('installed');
        }));

        this.subscriptions.push(actions.openAppStore.subscribe(() => {
            this.setCategory('store');
        }));
    },

    componentWillUnmount() {
        this.subscriptions.forEach(subscription => {
            subscription.dispose();
        });
    },

    renderAppCards() {
        return this.state.installedApps.map(app => {
            return <AppCard key={app.folderName}/>;
        });
    },

    renderSection(key) {
        const d2 = this.props.d2;
        const styles = {
            progress: {
                marginTop: '1rem',
                padding: '1rem',
                border: '1px solid #c1c1c1',
                borderRadius: 3,
            },
        };

        if (key === 'store') {
            return (
                <div className="content-area">
                    <h1>{this.state.appStore.name}</h1>
                    <AppStore appStore={this.state.appStore}/>
                </div>
            );
        }

        return (
            <div className="content-area">
                <h1>{d2.i18n.getTranslation('installed_applications')}</h1>
                <AppList installedApps={this.state.installedApps}/>
                {this.state.installing ? (
                    <div style={styles.progress}>
                        {d2.i18n.getTranslation('installing')}
                        <CircularProgress mode="indeterminate"/>
                    </div>
                ) : undefined}
                {this.state.uploading ? (
                    <div style={styles.progress}>
                        {d2.i18n.getTranslation('uploading')}
                        <LinearProgress mode="indeterminate"/>
                    </div>
                ) : undefined}
            </div>
        );
    },

    render() {
        const d2 = this.props.d2;
        const categories = [
            {key: 'installed', label: d2.i18n.getTranslation('installed_apps')},
            {key: 'store', label: d2.i18n.getTranslation('dhis2_app_store')},
        ];

        return (
            <div className="app">
                <HeaderBar />
                <Sidebar categories={categories} currentCategory={this.state.section} onSetCategory={this.setCategory}/>
                {this.renderSection(this.state.section)}
            </div>
        );
    },

    reloadInstalledApps() {
        actions.refreshApps();
    },

    setCategory(key) {
        this.setState({section: key});
    },
});
