import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import { CssVariables } from '@dhis2/ui'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import React from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import styles from './App.module.css'
import CoreApps from './components/CoreApps'
import CustomApps from './components/CustomApps'
import Sidebar from './components/Sidebar'
import './locales'

import installedAppHub from './stores/installedApp.store'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import './scss/style.scss'
import theme from './theme'

// TODO
const AppHub = () => null
const ManualInstall = () => null

const App = () => {
    const { d2 } = useD2({
        onInitialized: d2 => {
            installedAppHub.setState(d2.system.installedApps)
        },
    })

    if (!d2) {
        return null
    }

    return (
        <MuiThemeProvider muiTheme={theme}>
            <CssVariables spacers colors />
            <HashRouter>
                <div className={styles.container}>
                    <div className={styles.sidebar}>
                        <Sidebar />
                    </div>

                    <main className={styles.content}>
                        <Switch>
                            <Route exact path="/" component={CoreApps} />
                            <Route path="/custom-apps" component={CustomApps} />
                            <Route path="/discover" component={AppHub} />
                            <Route
                                path="/manual-install"
                                component={ManualInstall}
                            />
                            <Redirect from="*" to="/" />
                        </Switch>
                    </main>
                </div>
            </HashRouter>
        </MuiThemeProvider>
    )
}

export default App
