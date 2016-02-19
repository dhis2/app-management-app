import React from 'react';

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import FlatButton from 'material-ui/lib/flat-button';

import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import AppTheme from '../theme';
import actions from '../actions';

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
            this.setState({componentDidMount: true});
        }, 0);
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
                fontWeight: 100,
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

        return (
            <div>
                {this.props.appStore.apps.map(app => {
                    return (
                        <Card style={styles.card} key={app.name}>
                            <CardHeader title={app.name}
                                        subtitle={d2.i18n.getTranslation('by') + ' ' + app.developer}
                                        style={styles.cardTitle}
                                        titleColor="white"
                                        subtitleStyle={styles.cardTitleSubtitle}/>
                            <CardText style={styles.cardText}>{app.description}</CardText>
                            <CardActions style={styles.actions}>
                                {app.versions.map(version => {
                                    return (
                                        <FlatButton
                                            key={version.id}
                                            style={styles.button}
                                            primary
                                            onClick={this.install.bind(this, [app.name, version.id])}
                                            label={d2.i18n.getTranslation('install') + ' v' + version.version}/>
                                    );
                                })}
                            </CardActions>
                        </Card>
                    );
                })}
            </div>
        );
    },

    render() {
        const storeDescription = ((this.props.appStore.description || '') + '').trim();
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
                fontWeight: 100,
                color: AppTheme.rawTheme.palette.textColor,
                padding: '16px 0 5px 16px',
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
                fontWeight: 100,
            },
            apps: {
                paddingTop: '1rem',
            },
            description: {
                padding: '1rem',
                color: 'gray',
                borderRadius: 3,
                clear: 'both',
                fontWeight: 100,
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

    parseDescription(description) {
        return {
            __html: description
                // Linkify email addresses
                .replace(/([\w\.]*\w@[\w\.]*\w\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" rel="nofollow" target="_blank">$1</a>')
                // Linkify http:// and https:// links
                .replace(/(https?:\/\/[\w\.\/]*)/g, '<a href="$1" rel="nofollow" target="_blank">$1</a>')
                // Convert newlines to HTML line breaks
                .replace(/\n/g, '\n<br/>'),
        };
    },

    install(uid) {
        actions.installAppVersion(uid);
    },
});
