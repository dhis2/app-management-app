import React from 'react';

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import RaisedButton from 'material-ui/lib/raised-button';
import CardText from 'material-ui/lib/card/card-text';

import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import AppTheme from '../theme';
import actions from '../actions';

export default React.createClass({
    propTypes: {
        appStore: React.PropTypes.object.isRequired,
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
        };
    },

    componentWillMount() {
        if (!this.props.appStore.apps) {
            actions.loadAppStore();
        }
    },

    renderApps() {
        const d2 = this.context.d2;
        const styles = {
            card: {
                width: 284,
                float: 'left',
                marginRight: '1rem',
                marginBottom: '1rem',
            },
            cardTitle: {
                background: AppTheme.baseTheme.palette.primary2Color,
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
                                        style={styles.cardTitle}/>
                            <CardText style={styles.cardText}>{app.description}</CardText>
                            <CardActions style={styles.actions}>
                                {app.versions.map(version => {
                                    return (
                                        <RaisedButton
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
                backgroundColor: 'rgba(255,255,255,0.4)',
            },
            apps: {
                paddingTop: '1rem',
            },
            description: {
                padding: '1rem 0',
                color: 'gray',
                borderRadius: 3,
                clear: 'both',
            },
        };

        return this.props.appStore.apps ? (
            <div>
                {storeDescription.length > 0 ? (
                    <div style={styles.description}>{storeDescription}</div>
                ) : undefined}
                <div style={styles.apps}>{this.renderApps()}</div>
            </div>
        ) : (
            <div style={styles.loadingMaskContainer}>
                <LoadingMask />
            </div>
        );
    },

    install(uid) {
        actions.installAppVersion(uid);
    },
});
