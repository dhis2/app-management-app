import React from 'react';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import TextField from 'material-ui/lib/text-field';
import FontIcon from 'material-ui/lib/font-icon';


const Sidebar = React.createClass({
    propTypes: {
        showSearchField: React.PropTypes.bool,
        sections: React.PropTypes.arrayOf(React.PropTypes.shape({
            key: React.PropTypes.string,
            label: React.PropTypes.string,
        })).isRequired,
        currentSection: React.PropTypes.string,
        onChangeSection: React.PropTypes.func.isRequired,
    },

    contextTypes: {
        d2: React.PropTypes.object,
        muiTheme: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            showSearchField: false,
        };
    },

    componentWillReceiveProps(props) {
        if (props.currentSection) {
            this.setState({currentSection: props.currentSection});
        }
    },

    getInitialState() {
        return {
            currentSection: this.props.currentSection || this.props.sections[0].key,
        };
    },

    renderSearchField() {
        const d2 = this.context.d2;
        if (this.props.showSearchField) {
            return (
                <div style={{padding: '1rem 1rem 0', position: 'relative'}}>
                    <TextField hintText={d2.i18n.getTranslation('search')} style={{width: '100%'}}
                               onChange={this.search} ref="searchBox" />
                    {this.state && this.state.showCloseButton ? <FontIcon style={closeButtonStyle} className="material-icons" onClick={this.clearSearchBox}>clear</FontIcon> : null}
                </div>
            );
        }
    },

    renderSections() {
        const style = {
            item: {
                fontSize: 14,
            },
            activeItem: {
                fontSize: 14,
                fontWeight: 700,
                color: '#2196f3',
                backgroundColor: '#e9e9e9',
            },

        };

        return (
            <List style={{backgroundColor: 'transparent'}}>
                {this.props.sections.map(section => {
                    return (
                        <ListItem
                            key={section.key}
                            primaryText={section.label}
                            onClick={this.setSection.bind(this, section.key)}
                            style={section.key === this.state.currentSection ? style.activeItem : style.item} />
                    );
                })}
            </List>
        );
    },

    render() {
        const style = {
            sidebar: {
                backgroundColor: '#f3f3f3',
                borderRight: '1px solid #e1e1e1',
                overflowY: 'auto',
                width: 256,
            },
        };

        return (
            <div style={style.sidebar} className="left-bar">
                {this.renderSearchField()}
                {this.renderSections()}
            </div>
        );
    },

    setSection(key) {
        if (key !== this.state.currentSection) {
            this.setState({currentSection: key});
            this.props.onChangeSection(key);
        }
    },
});

export default Sidebar;
