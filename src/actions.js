import {Action} from 'd2-flux';
import {getInstance as getD2} from 'd2/lib/d2';
import log from 'loglevel';

import installedAppStore from './stores/installedApps.store';
import appStoreStore from './stores/appStore.store';

const actions = {
    // App management actions
    installApp: Action.create('Install App'),
    uninstallApp: Action.create('Uninstall App'),
    refreshApps: Action.create('Refresh Apps'),

    // App store actions
    loadAppStore: Action.create('Load DHIS2 App Store'),
    installAppVersion: Action.create('Install App Version from DHIS2 App Store'),
    openAppStore: Action.create('Open the DHIS2 App Store'),
};


/*
 * Install app from zip file
 */
actions.installApp.subscribe(params => {
    const [zipFile, progressCallback] = (Array.isArray(params.data) ? params.data : [params.data, undefined]);

    getD2().then(d2 => {
        d2.system.uploadApp(zipFile, progressCallback)
            .then(() => {
                actions.refreshApps();
            }).catch(err => {
                log.error('Failed to install app:', err.message);
                actions.refreshApps();
            });
    });
});


/*
 * Uninstall app
 */
actions.uninstallApp.subscribe(params => {
    const appKey = params.data;
    getD2().then(d2 => {
        d2.system.uninstallApp(appKey).then(() => {
            actions.refreshApps();
        });
    });
});


/*
 * Refresh the list of installed apps
 */
actions.refreshApps.subscribe(() => {
    getD2().then(d2 => {
        d2.system.reloadApps().then(apps => {
            installedAppStore.setState(apps);
        });
    });
});


/*
 * Load the app store
 */
actions.loadAppStore.subscribe(() => {
    getD2().then(d2 => {
        d2.system.loadAppStore().then(apps => {
            appStoreStore.setState(apps);
        });
    });
});


/*
 * Install app version from the app store
 */
actions.installAppVersion.subscribe(params => {
    const versionId = params.data[1];

    getD2().then(d2 => {
        d2.system.installAppVersion(versionId).then(() => {
            return d2.system.reloadApps();
        }).then(apps => {
            installedAppStore.setState(apps);
        });
    });
});

export default actions;
