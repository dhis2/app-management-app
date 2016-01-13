if (process.env.NODE_ENV !== 'production') {
    require('../dev-jquery-auth.js');
}

// Third party
import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import appStoreStore from './stores/appStore.store';
import installedAppStore from './stores/installedApps.store';

import actions from './actions';

import injectTapEventPlugin from 'react-tap-event-plugin'; injectTapEventPlugin();

// D2 / D2-UI
import D2Library from 'd2/lib/d2';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

// Components
import App from './components/App.component';

require('../scss/style.scss');

log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.WARN : log.levels.TRACE);

D2Library.getManifest(process.env.NODE_ENV === 'production' ? 'manifest.webapp' : 'dev_manifest.webapp')
    .then(manifest => {
        D2Library.config.baseUrl = manifest.getBaseUrl() + '/api';
    })
    .then(D2Library.getUserSettings)
    .then(userSettings => {
        if (userSettings.uiLocale !== 'en') {
            D2Library.config.i18n.sources.add('i18n/i18n_module_' + userSettings.uiLocale + '.properties');
        }
        D2Library.config.i18n.sources.add('i18n/i18n_module_en.properties');
    })
    .then(D2Library.init)
    .then(d2 => {
        ReactDOM.render(
            <App
                d2={d2}
                installedApps={installedAppStore}
                appStore={appStoreStore}
            />,
            document.getElementById('app')
        );
        log.info('D2 initialised:', d2);

        actions.refreshApps();
    })
    .catch(error => {
        ReactDOM.render((<div>Failed to initialise D2: {error}</div>), document.getElementById('app'));
    });

ReactDOM.render(<LoadingMask />, document.getElementById('app'));
