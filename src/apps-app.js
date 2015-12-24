if (process.env.NODE_ENV !== 'production') {
    require('../dev-jquery-auth.js');
}

// Third party
import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import appStoreStore from './stores/appStore.store';
import installedAppStore from './stores/installedApps.store';

//import injectTapEventPlugin from 'react-tap-event-plugin'; injectTapEventPlugin();

// D2 / D2-UI
import D2Lib from 'd2/src/d2';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

// Components
import App from './components/App.component';

require('material-design-lite/src/material-design-lite.scss');
require('../scss/style.scss');


D2Lib.getManifest(process.env.NODE_ENV === 'production' ? 'manifest.webapp' : 'dev_manifest.webapp')
    .then(manifest => {
        D2Lib.config.baseUrl = manifest.getBaseUrl() + '/api';
        //D2Lib.config.baseUrl = 'https://play.dhis2.org/demo/api';
    })
    .then(D2Lib.getUserSettings)
    .then(userSettings => {
        if (userSettings.uiLocale !== 'en') {
            D2Lib.config.i18n.sources.add('i18n/i18n_module_' + userSettings.uiLocale + '.properties');
        }
        D2Lib.config.i18n.sources.add('i18n/i18n_module_en.properties');
    })
    .then(D2Lib.init)
    .then(d2 => {
        // TODO: Remove!
        window.d2 = d2;

        ReactDOM.render(<App d2={d2} installedApps={installedAppStore} appStore={appStoreStore}/>, document.getElementById('app'));
        log.info('D2 initialised:', d2);

        installedAppStore.setState(d2.system.installedApps);

        d2.system.loadAppStore().then(appStore => {
            appStoreStore.setState(appStore);
        });
    });

ReactDOM.render(<LoadingMask />, document.getElementById('app'));
