var path = require('path');

module.exports = {
    context: __dirname,
    entry: './src/apps-app.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: 'apps-app.js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'stage-2', 'react'],
                },
            },
            {
                test: /\.js$/,
                loader: 'exports',
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass',
            },
        ],
    },
    resolve: {
        alias: {
            react: path.resolve('./node_modules/react'),
            'material-ui': path.resolve('./node_modules/material-ui'),
        },
    },
};
