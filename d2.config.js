/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',
    id: '28823170-1203-46d1-81d5-eea67abae41c',
    name: 'app-management',
    title: 'App Management',
    coreApp: true,

    minDHIS2Version: '2.37',

    entryPoints: {
        app: './src/App.jsx',
    },

    shortcuts: [
        { url: '#/', name: 'Core apps' },
        { url: '#/custom-apps', name: 'Custom apps' },
        { url: '#/app-hub', name: 'App Hub' },
        { url: '#/manual-install', name: 'Manual install' },
    ],
}

module.exports = config
