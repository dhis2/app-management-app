import Action from 'd2-ui/lib/action/Action';
import { getInstance as getD2 } from 'd2/lib/d2';
import log from 'loglevel';

import appStoreStore from './stores/appStore.store';
import installedAppStore from './stores/installedApp.store';

import i18n from '@dhis2/d2-i18n';

const actions = {
    // App management actions
    installApp: Action.create('Install App'),
    uninstallApp: Action.create('Uninstall App'),
    refreshApps: Action.create('Refresh Apps'),
    appInstalled: Action.create('An app was installed'),

    // App store actions
    loadAppStore: Action.create('Load DHIS2 App Store'),
    installAppVersion: Action.create('Install App Version from DHIS2 App Store'),

    // Snackbar
    showSnackbarMessage: Action.create('Show Snackbar message'),
};


/*
 * Install app from zip file
 */
actions.installApp.subscribe((params) => {
    const [zipFile, progressCallback] = (Array.isArray(params.data) ? params.data : [params.data, undefined]);

    getD2().then((d2) => {
        d2.system.uploadApp(zipFile, progressCallback)
            .then(() => d2.system.reloadApps())
            .then((apps) => {
                installedAppStore.setState(apps);

                actions.showSnackbarMessage(i18n.t('App installed successfully'));
                actions.appInstalled(zipFile.name.substring(0, zipFile.name.lastIndexOf('.')));
                actions.refreshApps();
                params.complete();
            })
            .catch((err) => {
                let message = i18n.t('Failed to install app');
                if (err.message) {
                    message += `: ${err.message}`;
                }
                actions.showSnackbarMessage(message);
                log.error('Failed to install app:', err.message || err);
                actions.refreshApps();
            });
    });
});


/*
 * Uninstall app
 */
actions.uninstallApp.subscribe((params) => {
    const appKey = params.data[0];
    getD2().then((d2) => {
        d2.system.uninstallApp(appKey).then(() => {
            actions.showSnackbarMessage(i18n.t('App removed successfully'));
            actions.refreshApps();
        });
    });
});


/*
 * Refresh the list of installed apps
 */
actions.refreshApps.subscribe(() => {
    getD2().then((d2) => {
        d2.system.reloadApps().then((apps) => {
            installedAppStore.setState(apps);
        });
    });
});


/*
 * Load the app store
 */
actions.loadAppStore.subscribe(() => {
    getD2().then((d2) => {
        d2.system.loadAppStore().then((apps) => {
            appStoreStore.setState(Object.assign(appStoreStore.getState() || {}, { apps }));
        });
    });
});


/*
 * Install app version from the app store
 */
actions.installAppVersion.subscribe((params) => {
    const versionId = params.data[0];
    const appStoreState = appStoreStore.getState();
    appStoreStore.setState(Object.assign(appStoreState, {
        installing: appStoreState.installing ? appStoreState.installing + 1 : 1,
    }));

    getD2().then((d2) => {
        actions.showSnackbarMessage(i18n.t('Installing app from the app store...'));
        d2.system.installAppVersion(versionId)
            .then(() => d2.system.reloadApps())
            .then((apps) => {
                actions.showSnackbarMessage(i18n.t('App installed successfully'));
                const appStoreState2 = appStoreStore.getState();
                appStoreStore.setState(Object.assign(appStoreState2, { installing: appStoreState2.installing - 1 }));
                installedAppStore.setState(apps);
                params.complete(apps);
            })
            .catch((err) => {
                actions.showSnackbarMessage(
                    `${i18n.t('Failed to install an app from the app store')}: ${err.message}`,
                );
                appStoreStore.setState(Object.assign(appStoreStore.getState(), {
                    installing: appStoreStore.getState().installing - 1,
                }));
                log.error(err);
            });
    });
});

export default actions;
