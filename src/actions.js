import {Action} from 'd2-flux';
import {getInstance as getD2} from 'd2/lib/d2';
import log from 'loglevel';

import appStoreStore from './stores/appStore.store';
import installedAppStore from './stores/installedApp.store';

const actions = {
    // App management actions
    installApp: Action.create('Install App'),
    uninstallApp: Action.create('Uninstall App'),
    refreshApps: Action.create('Refresh Apps'),

    // App store actions
    loadAppStore: Action.create('Load DHIS2 App Store'),
    installAppVersion: Action.create('Install App Version from DHIS2 App Store'),

    // Snackbar
    showSnackbarMessage: Action.create('Show Snackbar message'),
};


/*
 * Install app from zip file
 */
actions.installApp.subscribe(params => {
    const [zipFile, progressCallback] = (Array.isArray(params.data) ? params.data : [params.data, undefined]);

    getD2().then(d2 => {
        d2.system.uploadApp(zipFile, progressCallback)
            .then(() => {
                actions.showSnackbarMessage(d2.i18n.getTranslation('app_installed'));
                actions.refreshApps();
            }).catch(err => {
                actions.showSnackbarMessage(d2.i18n.getTranslation('failed_to_install_app') + ': ' + err.message);
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
            actions.showSnackbarMessage(d2.i18n.getTranslation('app_removed'));
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
    const appStoreState = appStoreStore.getState();
    appStoreStore.setState(Object.assign(appStoreState, {
        installing: appStoreState.installing ? appStoreState.installing + 1 : 1,
    }));

    getD2().then(d2 => {
        actions.showSnackbarMessage(d2.i18n.getTranslation('installing_app_from_app_store'));
        d2.system.installAppVersion(versionId)
            .then(() => d2.system.reloadApps())
            .then(apps => {
                actions.showSnackbarMessage(d2.i18n.getTranslation('app_installed'));
                const appStoreState2 = appStoreStore.getState();
                appStoreStore.setState(Object.assign(appStoreState2, {installing: appStoreState2.installing - 1}));
                installedAppStore.setState(apps);
                params.complete(apps);
            })
            .catch(err => {
                actions.showSnackbarMessage(d2.i18n.getTranslation('failed_to_install_app_from_app_store') + ': ' + err);
                log.error(err);
                params.error(err);
            });
    });
});

export default actions;
