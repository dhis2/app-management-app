import { CssVariables } from '@dhis2/ui'
import React from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import styles from './App.module.css'
import { CoreApps } from './components/CoreApps/CoreApps'
import CustomAppDetails from './components/CustomAppDetails'
import CustomApps from './components/CustomApps'
import ManualInstall from './components/ManualInstall'
import Sidebar from './components/Sidebar'
import './locales'

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
                            path="/app/:appHubId"
                            component={CustomAppDetails}
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
