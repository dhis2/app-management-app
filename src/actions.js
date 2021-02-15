import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import Action from 'd2-ui/lib/action/Action'
import log from 'loglevel'
import appHubStore from './stores/appHub.store'
import installedAppHub from './stores/installedApp.store'

const actions = {
    // App management actions
    installApp: Action.create('Install App'),
    uninstallApp: Action.create('Uninstall App'),
    refreshApps: Action.create('Refresh Apps'),
    appInstalled: Action.create('An app was installed'),

    // App store actions
    loadAppHub: Action.create('Load DHIS2 App Hub'),
    installAppVersion: Action.create('Install App Version from DHIS2 App Hub'),

    // Snackbar
    showSnackbarMessage: Action.create('Show Snackbar message'),
}

/*
 * Install app from zip file
 */
actions.installApp.subscribe(params => {
    const [zipFile, progressCallback] = Array.isArray(params.data)
        ? params.data
        : [params.data, undefined]

    getD2().then(d2 => {
        d2.system
            .uploadApp(zipFile, progressCallback)
            .then(() => d2.system.reloadApps())
            .then(apps => {
                installedAppHub.setState(apps)

                actions.showSnackbarMessage(
                    i18n.t('App installed successfully')
                )
                actions.appInstalled(
                    zipFile.name.substring(0, zipFile.name.lastIndexOf('.'))
                )
                actions.refreshApps()
                params.complete()
            })
            .catch(err => {
                let message = i18n.t('Failed to install app')
                if (err.message) {
                    message += `: ${err.message}`
                }
                actions.showSnackbarMessage(message)
                log.error('Failed to install app:', err.message || err)
                actions.refreshApps()
            })
    })
})

/*
 * Uninstall app
 */
actions.uninstallApp.subscribe(params => {
    const appKey = params.data[0]
    getD2().then(d2 => {
        d2.system.uninstallApp(appKey).then(() => {
            actions.showSnackbarMessage(i18n.t('App removed successfully'))
            actions.refreshApps()
        })
    })
})

/*
 * Refresh the list of installed apps
 */
actions.refreshApps.subscribe(() => {
    getD2().then(d2 => {
        d2.system.reloadApps().then(apps => {
            installedAppHub.setState(apps)
        })
    })
})

/*
 * Load the app hub
 */
actions.loadAppHub.subscribe(async () => {
    const d2 = await getD2()
    const baseUrl = d2.Api.getApi().baseUrl

    const fetchOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    const getDhisVersion = async () => {
        const response = await fetch(`${baseUrl}/system/info`, fetchOptions)
        const json = await response.json()
        //if we're running a dev version remove the snapshot suffix to just keep the dhis version
        return json.version.replace('-SNAPSHOT', '')
    }

    const version = await getDhisVersion()

    const response = await fetch(
        `${baseUrl}/appHub/v1/apps?dhis_version=${version}`,
        fetchOptions
    )

    const apps = await response.json()
    appHubStore.setState(Object.assign(appHubStore.getState() || {}, { apps }))
})

/*
 * Install app version from the app hub
 */
actions.installAppVersion.subscribe(params => {
    const versionId = params.data[0]
    const appHubState = appHubStore.getState()
    appHubStore.setState(
        Object.assign(appHubState, {
            installing: appHubState.installing ? appHubState.installing + 1 : 1,
        })
    )

    getD2().then(d2 => {
        actions.showSnackbarMessage(
            i18n.t('Installing app from the app hub...')
        )
        installAppVersion(versionId, d2)
            .then(() => d2.system.reloadApps())
            .then(apps => {
                actions.showSnackbarMessage(
                    i18n.t('App installed successfully')
                )
                const appHubState2 = appHubStore.getState()
                appHubStore.setState(
                    Object.assign(appHubState2, {
                        installing: appHubState2.installing - 1,
                    })
                )
                installedAppHub.setState(apps)
                params.complete(apps)
            })
            .catch(err => {
                actions.showSnackbarMessage(
                    `${i18n.t('Failed to install an app from the app hub')}: ${
                        err.message
                    }`
                )
                appHubStore.setState(
                    Object.assign(appHubStore.getState(), {
                        installing: appHubStore.getState().installing - 1,
                    })
                )
                log.error(err)
            })
    })
})

function installAppVersion(uid, d2) {
    const api = d2.Api.getApi()
    return new Promise((resolve, reject) => {
        api.post(['appHub', uid].join('/'), '', { dataType: 'text' })
            .then(() => {
                resolve()
            })
            .catch(err => {
                reject(err)
            })
    })
}

export default actions
