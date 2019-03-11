/* eslint-disable */
'use strict';

const webpack = require('webpack');
const webpackConfig = require('./webpack.base.config');

webpackConfig.mode = 'development';

let dhisConfig;

function getConfig() {
    const dhisConfigPath = process.env.DHIS2_HOME && `${process.env.DHIS2_HOME.trimRight('/')}/config`;
    console.log(`using config.json from ${dhisConfigPath}`)
    return require(dhisConfigPath);
}


try {
    dhisConfig = getConfig();
    console.log(dhisConfig)
} catch (e) {
    // Failed to load config file - use default config
    console.log('\nWARNING! Failed to load DHIS config:' + e.message);
    dhisConfig = {
        baseUrl: 'http://localhost:8080/',
        authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=', // admin:district
    };
}

webpackConfig.plugins = [
    new webpack.DefinePlugin({
        DHIS_CONFIG: JSON.stringify(dhisConfig)
    })
];

webpackConfig.devServer = {
    contentBase: './src',
    progress: true,
    port: 8081,
    open: true
};

module.exports = webpackConfig;

