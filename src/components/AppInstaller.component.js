import React from 'react';
import MaterialDesignLite from 'exports?componentHandler&MaterialLayout!material-design-lite/material.js';

export default React.createClass({
    propTypes: {
        appStore: React.PropTypes.object.isRequired,
        onAppInstall: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            appStore: {},
        };
    },

    renderApps() {
        if (this.props.appStore.apps && this.props.appStore.apps.length > 0) {
            return (
                <ol>{
                    this.props.appStore.apps.map(app => {
                        return (
                            <li key={app.name}>
                                {app.name}
                                <ul>{
                                    app.versions.map(version => {
                                        return <li key={version.id}>Version {version.version} <button onClick={this.install.bind(this, version.id)}>Install</button></li>;
                                    })
                                }</ul>
                            </li>
                        );
                    })
                }</ol>
            );
        }
    },

    render() {
        return (
            <div>
                {this.props.appStore.description}
                {this.renderApps()}
            </div>
        );
    },

    install(id) {
        // TODO: Replace with action
        this.context.d2.system.installApp(id).then(() => {
            this.props.onAppInstall();
        });
    },
});
