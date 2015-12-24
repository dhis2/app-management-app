import React from 'react';

export default React.createClass({
    propTypes: {
        flipped: React.PropTypes.bool,
    },

    getInitialState() {
        return {
            flipped: false,
        };
    },

    render() {
        const cardStyle = this.state.flipped ? {transform: 'rotateY(180deg)'} : {transform: 'rotateY(0deg)'};
        const cardBackStyle = this.state.flipped ? {transform: 'rotateY(0deg)'} : {transform: 'rotateY(-180deg)'};

        return (
            <div className="app-card-container">
                <div className="app-card mdl-card mdl-shadow--2dp" style={cardStyle}>
                    <div className="mdl-card__title mdl-card--expand" style={{background: '#46B6AC'}}>
                        <h2 className="mdl-card__title-text">Tabular Tracker Capture</h2>
                    </div>
                    <div className="mdl-card__supporting-text mdl-card--border">Tabular Tracker Capture is an app.</div>
                    <div className="mdl-card__actions mdl-card--border">
                        <a className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">Install</a>
                        <a className="mdl-button mdl-js-button mdl-js-ripple-effect" onClick={this.flip}>More info</a>
                    </div>
                </div>
                <div className="app-card-back mdl-card mdl-shadow--2dp" style={cardBackStyle}>
                    <div className="mdl-card__title mdl-card--expand" style={{background: 'red'}}>
                        <h2 className="mdl-card__title-text">Tabular Tracker Capture</h2>
                    </div>
                    <div className="mdl-card__supporting-text mdl-card--border">You can easily navigate between organisation units, time periods and
                        enrollment status.
                    </div>
                    <div className="mdl-card__actions mdl-card--border">
                        <a className="mdl-button mdl-js-button mdl-js-ripple-effect" onClick={this.flip}>Unflip</a>
                    </div>
                </div>
            </div>
        );
    },

    flip() {
        this.setState(state => {
            return {flipped: !state.flipped};
        });
    },
});
