/* eslint-disable comma-dangle */

const webpack = require('webpack');
const webpackConfig = require('./webpack.base.config');

webpackConfig.mode = 'production';
webpackConfig.plugins = [
    // Replace any occurance of process.env.NODE_ENV with the string 'production'
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: '\'production\'',
        },
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
        DHIS_CONFIG: JSON.stringify({})
    })
];

module.exports = webpackConfig;

