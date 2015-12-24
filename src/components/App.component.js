// noinspection JSFileReferences
import MaterialDesignLite from 'exports?componentHandler&MaterialLayout!material-design-lite/material.js';
import React from 'react';
import HeaderBar from 'd2-ui/lib/header-bar/HeaderBar.component';

import AppCard from './AppCard.component';
import AppList from './AppList.component';
import AppInstaller from './AppInstaller.component';


export default React.createClass({
    propTypes: {
        d2: React.PropTypes.object.isRequired,
        installedApps: React.PropTypes.object.isRequired,
        appStore: React.PropTypes.object.isRequired,
    },

    childContextTypes: {
        d2: React.PropTypes.object,
    },

    getChildContext() {
        return {
            d2: this.props.d2,
        };
    },

    getInitialState() {
        return {
            installedApps: [],
            appStore: {
                name: 'App Store',
            },
        };
    },

    componentDidMount() {
        MaterialDesignLite.componentHandler.upgradeDom();

        this.subscriptions = [];
        this.subscriptions.push(this.props.installedApps.subscribe(installedApps => {
            this.setState({ installedApps: installedApps });
        }));

        this.subscriptions.push(this.props.appStore.subscribe(appStore => {
            this.setState({ appStore: appStore }, () => {
                MaterialDesignLite.componentHandler.upgradeDom();
            });
        }));
    },

    componentWillUnmount() {
        this.subscriptions.forEach(sub => {
            sub.dispose();
        });
    },

    renderAppCards() {
        return this.state.installedApps.map(app => {
            return <AppCard key={app.folderName}/>;
        });
    },

    render() {
        return (
            <div className="content-area">
                <HeaderBar />
                <div className="mdl-tabs mdl-js-tabs mdl-js-ripple-effect">
                    <div className="mdl-tabs__tab-bar">
                        <a href="#manage" className="mdl-tabs__tab is-active">App Management</a>
                        <a href="#install" className="mdl-tabs__tab">DHIS2 App Store</a>
                    </div>

                    <div className="mdl-tabs__panel is-active" id="manage">
                        <AppList installedApps={this.state.installedApps} onAppUpdate={this.reloadInstalledApps} />
                    </div>
                    <div className="mdl-tabs__panel" id="install">
                        <AppInstaller appStore={this.state.appStore} onAppInstall={this.reloadInstalledApps} />
                    </div>
                </div>
            </div>
        );
    },

    reloadInstalledApps() {
        // TODO: Replace with action
        this.props.d2.system.reloadInstalledApps().then(apps => {
            this.setState({installedApps: apps});
        });
    },
});
