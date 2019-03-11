/* eslint-disable */

const webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: {
        app: './src/entry.js',
        vendor: [
            '@babel/polyfill',
        ],
    },
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: '[name].js',
    },
    module: {
        // Loaders that are used to load files
        rules: [
            // Babel loader to transpile ES2015 to ES5 code
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },

            // Css loader to load stylesheets
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },

            // Scss loader to allow webpack to transform scss code to css
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader',
            },
            
            {
                test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
                loader: 'file-loader'
            },
        ],
    }    
};

