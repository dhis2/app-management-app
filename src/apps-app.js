/* global document */
import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

import D2Library from 'd2/lib/d2';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import installedAppStore from './stores/installedApp.store';
import App from './components/App.component';
import theme from './theme';

require('../scss/style.scss');

injectTapEventPlugin();

const dhisDevConfig = DHIS_CONFIG; // eslint-disable-line

log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.DEBUG);

D2Library.getManifest('manifest.webapp')
    .then((manifest) => {
        const baseUrl = process.env.NODE_ENV === 'production' ? manifest.getBaseUrl() : dhisDevConfig.baseUrl;
        D2Library.config.baseUrl = `${baseUrl}/api`;
        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);
    })
    .then(D2Library.getUserSettings)
    .then((userSettings) => {
        if (userSettings.keyUiLocale !== 'en') {
            D2Library.config.i18n.sources.add(`i18n/i18n_module_${userSettings.keyUiLocale}.properties`);
        }
        D2Library.config.i18n.sources.add('i18n/i18n_module_en.properties');
    })
    .then(D2Library.init)
    .then((d2) => {
        log.debug('D2 initialized', d2);
        installedAppStore.setState(d2.system.installedApps);
        ReactDOM.render(
            <MuiThemeProvider muiTheme={theme}><App d2={d2} /></MuiThemeProvider>,
            document.getElementById('app'),
        );
    })
    .catch((error) => {
        log.error('D2 initialization error:', error);
        ReactDOM.render((<div>Failed to initialise D2</div>), document.getElementById('app'));
    });

ReactDOM.render(<MuiThemeProvider muiTheme={theme}><LoadingMask /></MuiThemeProvider>, document.getElementById('app'));
