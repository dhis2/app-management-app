import React from 'react'
import PropTypes from 'prop-types'

import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component'

import CircularProgress from 'material-ui/CircularProgress'
import LinearProgress from 'material-ui/LinearProgress'

import { Card, CardText } from 'material-ui/Card'
import Snackbar from 'material-ui/Snackbar'
import FontIcon from 'material-ui/FontIcon'

import AppList from './AppList.component'
import AppHub from './AppHub.component'
import SelfUpdateNoticeBox from './SelfUpdateNoticeBox.component'
import AppTheme from '../theme'

import actions, { wrapData as wrapActionData } from '../actions'
import appHubStore from '../stores/appHub.store'
import installedAppHub from '../stores/installedApp.store'

import i18n from '@dhis2/d2-i18n'

const styles = {
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: AppTheme.rawTheme.palette.textColor,
        padding: '24px 0 12px 16px',
    },
    noApps: {
        marginTop: 16,
        padding: '16px 0 5px 16px',
        fontWeight: 300,
        fontSize: 15,
    },
    progress: {
        margin: '16px 1rem 16px 0',
        padding: 16,
        maxWidth: 734,
    },
    installing: {
        marginRight: '1rem',
        paddingRight: '1rem',
        marginTop: 16,
        padding: 16,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 300,
        maxWidth: 734,
    },
    snackbar: {
        // left: '2rem',
        right: 'initial',
    },
    menuLabel: {
        position: 'relative',
        top: -6,
        marginLeft: 16,
    },
}

class App extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            installedApps: [],
            installing: false,
            section: 'bundled_app',
            uploading: false,
            progress: undefined,
            appHub: {},
            lastUpdate: null,
        }
    }

    getChildContext() {
        return {
            d2: this.props.d2,
            muiTheme: AppTheme,
        }
    }

    componentDidMount() {
        this.subscriptions = [
            installedAppHub.subscribe(installedApps => {
                this.setState({ installedApps, lastUpdate: new Date() })
            }),
            appHubStore.subscribe(appHub => {
                this.setState({
                    appHub,
                    installing:
                        appHub.installing !== undefined &&
                        appHub.installing > 0,
                })
            }),

            actions.installApp.subscribe(() => {
                this.setState({ uploading: true })
            }),
            actions.appInstalled.subscribe(({ data }) => {
                this.setState({ uploading: false })
                this.setSection(
                    installedAppHub.getAppFromKey(data).appType.toLowerCase() ||
                        'app'
                )
            }),
            actions.refreshApps.subscribe(() => {
                this.setState({ uploading: false })
            }),
            actions.showSnackbarMessage.subscribe(params => {
                if (this.state.snackbar) {
                    this.setState({ snackbar: undefined })
                    setTimeout(() => {
                        this.setState({ snackbar: params.data })
                    }, 150)
                } else {
                    this.setState({ snackbar: params.data })
                }
            }),
            actions.installAppVersion.subscribe(({ data }) => {
                const app = appHubStore.getAppFromVersionId(
                    wrapActionData(data)[0]
                )
                this.setSection(
                    (app.appType && app.appType.toLowerCase()) || 'app'
                )
            }),
        ]

        actions.loadAppHub()
    }

    componentWillUnmount() {
        this.subscriptions.forEach(subscription => {
            subscription.dispose()
        })
    }

    setSection = key => {
        if (this.sidebar) {
            this.sidebar.clearSearchBox()
        }
        this.setState({ section: key, appSearch: undefined })
    }

    progress = p => {
        if (p) {
            if (p === 1) {
                this.setState({ uploading: false, progress: undefined })
            } else {
                this.setState({ progress: p * 100 })
            }
        } else {
            this.setState({ progress: undefined })
        }
    }

    closeSnackbar = () => {
        this.setState({ snackbar: undefined })
    }

    showSnackbar = message => {
        this.setState({ snackbar: message })
    }

    search = text => {
        if (text.length > 0) {
            this.setState({
                appSearch: this.state.installedApps
                    .filter(
                        app =>
                            app.name
                                .toLowerCase()
                                .indexOf(text.toLowerCase()) !== -1
                    )
                    .sort(
                        (a, b) =>
                            a.appType.localeCompare(b.appType) ||
                            a.name.localeCompare(b.name)
                    ),
                appSearchText: text,
            })
        } else {
            this.setState({ appSearch: undefined, appSearchText: undefined })
        }
    }

    renderUploadProgress() {
        if (this.state.uploading) {
            return (
                <Card style={styles.progress}>
                    <CardText>
                        {i18n.t('Uploading...')}
                        <LinearProgress
                            mode={
                                this.state.progress
                                    ? 'determinate'
                                    : 'indeterminate'
                            }
                            color="#6688AA"
                            value={this.state.progress}
                        />
                    </CardText>
                </Card>
            )
        }

        return null
    }

    renderInstallProgress() {
        if (this.state.installing) {
            return (
                <div style={styles.installing}>
                    <CircularProgress
                        mode="indeterminate"
                        color="#6688AA"
                        value={this.state.progress}
                    />
                    <br />
                    <br />
                    {i18n.t('Installing...')}
                </div>
            )
        }

        return null
    }

    renderSection({ key, apps, showUpload }) {
        if (key === 'store') {
            return <AppHub appHub={this.state.appHub} d2={this.props.d2} />
        }

        const filter = (key && key.toString().toUpperCase()) || 'APP'

        return (
            <AppList
                d2={this.props.d2}
                installedApps={apps}
                uploadProgress={this.progress}
                transitionUnmount={this.state.unmountSection}
                showUpload={showUpload && !this.state.uploading}
                appHub={this.state.appHub}
                appTypeFilter={filter}
            />
        )
    }

    renderSearchResults() {
        const appsByType = this.state.appSearch.reduce((types, app) => {
            if (Object.prototype.hasOwnProperty.call(types, app.appType)) {
                types[app.appType].push(app)
            } else {
                types[app.appType] = [app]; // eslint-disable-line
            }

            return types
        }, {})

        if (Object.keys(appsByType).length) {
            return Object.entries(appsByType).map(([type, apps], i) => (
                <div key={type}>
                    {this.renderSection({
                        key: type,
                        apps,
                        showUpload: i === 0,
                    })}
                </div>
            ))
        }

        return (
            <div>
                <div style={styles.header}>{i18n.t('No apps found')}</div>
                <div style={styles.noApps}>
                    {i18n.t('No installed apps matched the search term')} &quot;
                    {this.state.appSearchText}&quot;
                </div>
            </div>
        )
    }

    render() {
        const sections = [
            {
                key: 'bundled_app',
                icon: 'widgets',
                label: i18n.t('Bundled Apps'),
            },
            {
                key: 'app',
                icon: 'desktop_windows',
                label: i18n.t('Standard Apps'),
            },
            {
                key: 'dashboard_widget',
                icon: 'wallpaper',
                label: i18n.t('Dashboard Apps'),
            },
            {
                key: 'tracker_dashboard_widget',
                icon: 'supervisor_account',
                label: i18n.t('Tracker Dashboard Apps'),
            },
            {
                key: 'resource',
                icon: 'data_usage',
                label: i18n.t('Resource Apps'),
            },
            {
                key: 'store',
                icon: 'store',
                label: i18n.t('App Hub'),
            },
        ].map(section => ({
            key: section.key,
            label: section.label,
            icon: (
                <FontIcon className="material-icons">{section.icon}</FontIcon>
            ),
        }))

        const reffer = r => {
            this.sidebar = r
        }

        return (
            <div className="app">
                <SelfUpdateNoticeBox appHub={this.state.appHub} />
                <Sidebar
                    sections={sections}
                    currentSection={this.state.section}
                    onChangeSection={this.setSection}
                    showSearchField
                    onChangeSearchText={this.search}
                    ref={reffer}
                />
                <Snackbar
                    message={this.state.snackbar || ''}
                    autoHideDuration={2500}
                    onRequestClose={this.closeSnackbar}
                    open={!!this.state.snackbar}
                    style={styles.snackbar}
                />
                <div className="content-area">
                    {this.state.appSearch
                        ? this.renderSearchResults()
                        : this.renderSection({
                              key: this.state.section,
                              apps: this.state.installedApps,
                              showUpload: true,
                          })}
                    {this.renderUploadProgress()}
                    {this.renderInstallProgress()}
                </div>
            </div>
        )
    }
}
App.propTypes = {
    d2: PropTypes.object.isRequired,
}

App.childContextTypes = {
    d2: PropTypes.object,
    muiTheme: PropTypes.object,
}

export default App
