import React from 'react';

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import FlatButton from 'material-ui/lib/flat-button';
import FontIcon from 'material-ui/lib/font-icon';
import Avatar from 'material-ui/lib/avatar';

import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import AppTheme from '../theme';
import actions from '../actions';


// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default React.createClass({
    propTypes: {
        appStore: React.PropTypes.object.isRequired,
        transitionUnmount: React.PropTypes.bool,
    },

    contextTypes: {
        d2: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            appStore: {},
        };
    },

    getInitialState() {
        return {
            installing: undefined,
            componentDidMount: false,
        };
    },

    componentWillMount() {
        if (!this.props.appStore.apps) {
            actions.loadAppStore();
        }
    },

    componentDidMount() {
        setTimeout(() => {
            this.setState({ componentDidMount: true });
        }, 0);
    },

    parseDescription(description) {
        return {
            __html: description
                // Linkify email addresses
                .replace(
                    /([\w\.]*\w@[\w\.]*\w\.[a-zA-Z]{2,})/g,
                    '<a href="mailto:$1" rel="nofollow" target="_blank">$1</a>'
                )
                // Linkify http:// and https:// links
                .replace(/(https?:\/\/[\w\.\/]*)/g, '<a href="$1" rel="nofollow" target="_blank">$1</a>')
                // Convert newlines to HTML line breaks
                .replace(/\n/g, '\n<br/>'),
        };
    },

    renderApps() {
        const d2 = this.context.d2;
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
        };
        const avatar = (
            <Avatar
                backgroundColor={AppTheme.rawTheme.palette.primary1Color}
                icon={<FontIcon className="material-icons">folder</FontIcon>}
            />
        );

        return (
            <div>
                {this.props.appStore.apps.map(app => (
                    <Card style={styles.card} key={app.name}>
                        <CardHeader
                            title={app.name}
                            subtitle={`${d2.i18n.getTranslation('by')} ${app.developer}`}
                            avatar={avatar}
                            style={styles.cardTitle}
                            titleColor="white"
                            subtitleStyle={styles.cardTitleSubtitle}
                        />
                        <CardText style={styles.cardText}>{app.description}</CardText>
                        <CardActions style={styles.actions}>
                            {app.versions.map(version => {
                                const install = actions.installAppVersion.bind(null, version.id);
                                return (
                                    <FlatButton
                                        key={version.id}
                                        style={styles.button}
                                        primary
                                        onClick={install}
                                        label={`${d2.i18n.getTranslation('install')} v${version.version}`}
                                    />
                                );
                            })}
                        </CardActions>
                    </Card>
                ))}
            </div>
        );
    },

    render() {
        const storeDescription = this.props.appStore.description || '';
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
        };

        return this.props.appStore.apps ? (
            <div>
                <div style={styles.header}>{this.props.appStore.name}</div>
                <div style={styles.description} dangerouslySetInnerHTML={this.parseDescription(storeDescription)}></div>
                <div style={styles.apps}>{this.renderApps()}</div>
            </div>
        ) : (
            <div style={styles.loadingMaskContainer}>
                <LoadingMask />
            </div>
        );
    },
});
