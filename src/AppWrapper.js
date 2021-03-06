import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import React from 'react'
import App from './components/App.component'
import installedAppHub from './stores/installedApp.store'
import theme from './theme'

import './locales'

import 'material-design-icons-iconfont/dist/material-design-icons.css'
import './scss/style.scss'

const AppWrapper = () => {
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
            <App d2={d2} />
        </MuiThemeProvider>
    )
}

export default AppWrapper
