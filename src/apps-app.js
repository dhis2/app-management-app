const dhisDevConfig = DHIS_CONFIG; // eslint-disable-line
if (process.env.NODE_ENV !== 'production') {
    jQuery.ajaxSetup({ headers: { Authorization: dhisDevConfig.authorization } }); // eslint-disable-line
}

// Third party
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import installedAppStore from './stores/installedApp.store';

import injectTapEventPlugin from 'react-tap-event-plugin'; injectTapEventPlugin();

// D2 / D2-UI
import D2Library from 'd2/lib/d2';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

// Components
import App from './components/App.component';

require('../scss/style.scss');

log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE);

D2Library.getManifest('manifest.webapp')
    .then(manifest => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : dhisDevConfig.baseUrl;
        D2Library.config.baseUrl = `${baseUrl}/api`;
        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);
    })
    .then(D2Library.getUserSettings)
    .then(userSettings => {
        if (userSettings.keyUiLocale !== 'en') {
            D2Library.config.i18n.sources.add(`i18n/i18n_module_${userSettings.keyUiLocale}.properties`);
        }
        D2Library.config.i18n.sources.add('i18n/i18n_module_en.properties');
    })
    .then(D2Library.init)
    .then(d2 => {
        log.debug('D2 initialized', d2);
        installedAppStore.setState(d2.system.installedApps);
        ReactDOM.render(
            <App d2={d2} />,
            document.getElementById('app')
        );
    })
    .catch(error => {
        log.error('D2 initialization error:', error);
        ReactDOM.render((<div>Failed to initialise D2</div>), document.getElementById('app'));
    });

ReactDOM.render(<LoadingMask />, document.getElementById('app'));
