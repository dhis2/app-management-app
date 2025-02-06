import { CssVariables } from '@dhis2/ui'
import React from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import styles from './App.module.css'
import { Sidebar } from './components/Sidebar/Sidebar.jsx'
import { AppHub } from './pages/AppHub/AppHub.jsx'
import { AppHubApp } from './pages/AppHubApp/AppHubApp.jsx'
import { CoreApps } from './pages/CoreApps/CoreApps.jsx'
import { CustomApps } from './pages/CustomApps/CustomApps.jsx'
import { InstalledApp } from './pages/InstalledApp/InstalledApp.jsx'
import { ManualInstall } from './pages/ManualInstall/ManualInstall.jsx'
import './locales/index.js'

// Used to ensure we are matching the pattern of a valid app hub id, which should be a UUID version 4
const APP_HUB_ID_REGEXP =
    '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'

const App = () => (
    <HashRouter>
        <QueryParamProvider
            ReactRouterRoute={Route}
            stringifyOptions={{ skipEmptyString: true }}
        >
            <CssVariables spacers colors />
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <Sidebar />
                </div>

                <main className={styles.content}>
                    <Switch>
                        <Route exact path="/" component={CoreApps} />
                        <Route
                            exact
                            path="/custom-apps"
                            component={CustomApps}
                        />
                        <Route
                            path="/installed-app/:appKey"
                            component={InstalledApp}
                        />
                        <Route path="/app-hub" component={AppHub} />
                        <Route
                            path={`/app/:appHubId(${APP_HUB_ID_REGEXP})`}
                            component={AppHubApp}
                        />
                        <Route
                            path="/manual-install"
                            component={ManualInstall}
                        />
                        <Redirect from="*" to="/" />
                    </Switch>
                </main>
            </div>
        </QueryParamProvider>
    </HashRouter>
)

export default App
