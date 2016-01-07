import React from 'react';

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import RaisedButton from 'material-ui/lib/raised-button';
import CardText from 'material-ui/lib/card/card-text';
import CircularProgress from 'material-ui/lib/circular-progress';

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
        actions.loadAppStore();
    },

    renderApps() {
        const d2 = this.context.d2;
        const styles = {
            card: {
                width: 320,
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
                height: 145,
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

        return this.props.appStore.apps ? (
            <div>{this.props.appStore.apps.map(app => {
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
            })}</div>
        ) : (<CircularProgress mode="indeterminate"/>);
    },

    render() {
        const d2 = this.context.d2;
        const storeDescription = ((this.props.appStore.description || '') + '').trim();
        const styles = {
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
            <div>
                <CircularProgress mode="indeterminate"/>
                <p>{d2.i18n.getTranslation('loading_app_store')}</p>
            </div>);
    },

    install(uid) {
        actions.installAppVersion(uid);
    },
});
