import React from 'react'
import { PropTypes } from '@dhis2/prop-types'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import Avatar from 'material-ui/Avatar'

import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component'

import AppTheme from '../theme'
import actions from '../actions'
import i18n from '@dhis2/d2-i18n'

/*
 * Discontinued...
function parseDescription(description) {
    return {
        __html: description
        // Linkify email addresses
            .replace(
                /([\w.]*\w@[\w.]*\w\.[a-zA-Z]{2,})/g,
                '<a href="mailto:$1" rel="nofollow" target="_blank">$1</a>'
            )
            // Linkify http:// and https:// links
            .replace(/(https?:\/\/[\w./]*)/g, '<a href="$1" rel="nofollow" target="_blank">$1</a>')
            // Convert newlines to HTML line breaks
            .replace(/\n/g, '\n<br/>'),
    };
}
*/

class AppHub extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            installing: undefined,
        }
    }

    UNSAFE_componentWillMount() {
        if (!Array.isArray(this.props.appHub.apps)) {
            actions.loadAppHub()
        }
    }

    renderApps() {
        const styles = {
            card: {
                width: 297,
                float: 'left',
                marginRight: '1rem',
                marginBottom: '1rem',
            },
            cardTitle: {
                background: '#5892BE',
                fontWeight: 400,
            },
            cardTitleSubtitle: {
                color: '#CCDDEE',
                fontWeight: 300,
                fontSize: 13,
                overflowX: 'hidden',
                overflowY: 'hidden',
                maxWidth: 205,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
            },
            cardText: {
                borderTop: '1px solid #c3c3c3',
                borderBottom: '1px solid #c3c3c3',
                height: 165,
                overflowY: 'hidden',
            },
            actions: {
                textAlign: 'right',
            },
            button: {
                marginRight: 0,
                marginLeft: 8,
            },
            flex: {
                display: 'flex',
                flexWrap: 'wrap',
            },
        }
        const avatar = (
            <Avatar
                backgroundColor={AppTheme.rawTheme.palette.primary1Color}
                icon={<FontIcon className="material-icons">folder</FontIcon>}
            />
        )

        return (
            <div style={styles.flex}>
                {this.props.appHub.apps.map(app => (
                    <Card style={styles.card} key={app.name}>
                        <CardHeader
                            title={app.name}
                            subtitle={`${i18n.t('By')} ${
                                app.developer.organisation
                            }`}
                            avatar={avatar}
                            style={styles.cardTitle}
                            titleColor="white"
                            subtitleStyle={styles.cardTitleSubtitle}
                        />
                        <CardText style={styles.cardText}>
                            {app.description}
                        </CardText>
                        <CardActions style={styles.actions}>
                            {app.versions.map(version => {
                                const install = actions.installAppVersion.bind(
                                    null,
                                    version.id
                                )
                                return (
                                    <FlatButton
                                        key={version.id}
                                        style={styles.button}
                                        primary
                                        onClick={install}
                                        label={`${i18n.t('Install')} v${
                                            version.version
                                        }`}
                                    />
                                )
                            })}
                        </CardActions>
                    </Card>
                ))}
            </div>
        )
    }

    render() {
        const styles = {
            loadingMaskContainer: {
                position: 'fixed',
                left: 256,
                top: '3rem',
                right: 0,
                bottom: 0,
                zIndex: 1000,
            },
            header: {
                fontSize: 24,
                fontWeight: 300,
                color: AppTheme.rawTheme.palette.textColor,
                padding: '24px 0 12px 16px',
            },
            card: {
                marginTop: 8,
                marginRight: '1rem',
            },
            cardTitle: {
                background: '#5892BE',
            },
            cardTitleText: {
                color: 'white',
                fontSize: 28,
                fontWeight: 300,
            },
            apps: {
                paddingTop: '1rem',
            },
            description: {
                padding: '1rem',
                color: 'gray',
                borderRadius: 3,
                clear: 'both',
                fontWeight: 300,
            },
        }

        return Array.isArray(this.props.appHub.apps) ? (
            <div>
                <div style={styles.header}>{i18n.t('App Hub')}</div>
                <div style={styles.apps}>{this.renderApps()}</div>
            </div>
        ) : (
            <div style={styles.loadingMaskContainer}>
                <LoadingMask />
            </div>
        )
    }
}
AppHub.propTypes = {
    appHub: PropTypes.object.isRequired,
}
AppHub.defaultProps = {
    appHub: {},
}

export default AppHub
