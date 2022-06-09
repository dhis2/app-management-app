import { CssVariables } from '@dhis2/ui'
import React from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import styles from './App.module.css'
import { Sidebar } from './components/Sidebar/Sidebar.js'
import { AppHub } from './pages/AppHub/AppHub.js'
import { AppHubApp } from './pages/AppHubApp/AppHubApp.js'
import { CoreApps } from './pages/CoreApps/CoreApps.js'
import { CustomApps } from './pages/CustomApps/CustomApps.js'
import { InstalledApp } from './pages/InstalledApp/InstalledApp.js'
import { ManualInstall } from './pages/ManualInstall/ManualInstall.js'
import './locales/index.js'

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
                        <Route path="/app/:appHubId" component={AppHubApp} />
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
