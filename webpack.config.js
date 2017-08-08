'use strict';

const webpack = require('webpack');
const path = require('path');
const colors = require('colors');

const isDevBuild = process.argv[1].indexOf('webpack-dev-server') !== -1;
const dhisConfigPath = process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config`;
let dhisConfig;

try {
    dhisConfig = require(dhisConfigPath);
    console.log('\nLoaded DHIS config:');
} catch (e) {
    // Failed to load config file - use default config
    console.warn(`\nWARNING! Failed to load DHIS config:`, e.message);
    console.info('Using default config');
    dhisConfig = {
        baseUrl: 'http://localhost:8080/dhis',
        authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=', // admin:district
    };
}
console.log(JSON.stringify(dhisConfig, null, 2), '\n');

function log(req, res, opt) {
    req.headers.Authorization = dhisConfig.authorization;
    console.log('[PROXY]'.cyan.bold, req.method.green.bold, req.url.magenta, '=>'.dim, opt.target.dim);
}

const webpackConfig = {
    context: __dirname,
    entry: './src/apps-app.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/build',
        filename: 'apps-app.js',
        publicPath: 'http://localhost:8081/',
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'stage-0', 'react'],
                },
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader',
            },
        ],
    },
    resolve: {
        alias: {
            react: path.resolve('./node_modules/react'),
            'material-ui': path.resolve('./node_modules/material-ui'),
        },
    },
    devServer: {
        port: 8081,
        inline: true,
        compress: true,
        proxy: [
            { path: '/api/**', target: dhisConfig.baseUrl, bypass: log },
            { path: '/dhis-web-commons/**', target: dhisConfig.baseUrl, bypass: log },
            { path: '/icons/**', target: dhisConfig.baseUrl, bypass: log },
        ],
    },
};

if (!isDevBuild) {
    webpackConfig.plugins = [
        // Replace any occurance of process.env.NODE_ENV with the string 'production'
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
            DHIS_CONFIG: JSON.stringify({}),
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            //     compress: {
            //         warnings: false,
            //     },
            comments: false,
            beautify: true,
        }),
    ];
} else {
    // Replace any occurance of DHIS_CONFIG with an object with baseUrl and authorization props
    webpackConfig.plugins = [
        new webpack.DefinePlugin({
            DHIS_CONFIG: JSON.stringify(dhisConfig),
        }),
    ];
}

module.exports = webpackConfig;

