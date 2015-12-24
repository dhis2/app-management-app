import React from 'react';

export default React.createClass({
    propTypes: {
        installedApps: React.PropTypes.array.isRequired,
        onAppUpdate: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    render() {
        return (
            <div>
                <ul>
                    {this.props.installedApps.map(app => {
                        return <li key={app.folderName}>{app.name} <button onClick={this.uninstall.bind(this, app.folderName)}>Uninstall</button> <button>Refresh</button></li>;
                    })}
                </ul>
                Upload a new app: <input type="file" onChange={this.upload} />
            </div>
        );
    },

    uninstall(appKey) {
        // TODO: Replace with uninstall action
        this.context.d2.system.uninstallApp(appKey).then(() => {
            this.props.onAppUpdate();
        });
    },

    refresh(appKey) {
        // TODO: Replace with refresh action
        this.context.d2.system.refreshApp(appKey).then(() => {
            this.props.onAppUpdate();
        });
    },

    upload(e) {
        // TODO: Replace with upload action
        this.context.d2.system.uploadApp(e.target.files[0]).then(() => {
            this.props.onAppUpdate();
        });
    },
});
