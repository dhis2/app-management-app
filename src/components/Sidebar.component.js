import React from 'react';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import TextField from 'material-ui/lib/text-field';
import FontIcon from 'material-ui/lib/font-icon';


const Sidebar = React.createClass({
    propTypes: {
        showSearchField: React.PropTypes.bool,
        categories: React.PropTypes.arrayOf(React.PropTypes.shape({
            key: React.PropTypes.string,
            label: React.PropTypes.string,
        })).isRequired,
        currentCategory: React.PropTypes.string,
        onSetCategory: React.PropTypes.func.isRequired,
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
        if (props.currentCategory) {
            this.setState({currentCategory: props.currentCategory});
        }
    },

    getInitialState() {
        return {
            currentCategory: this.props.currentCategory || this.props.categories[0].key,
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

    renderCategories() {
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
                {this.props.categories.map(category => {
                    return (
                        <ListItem
                            key={category.key}
                            primaryText={category.label}
                            onClick={this.setCategory.bind(this, category.key)}
                            style={category.key === this.state.currentCategory ? style.activeItem : style.item} />
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
                {this.renderCategories()}
            </div>
        );
    },

    setCategory(key) {
        if (key !== this.state.currentCategory) {
            this.setState({currentCategory: key});
            this.props.onSetCategory(key);
        }
    },
});

export default Sidebar;
