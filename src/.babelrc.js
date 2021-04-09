const pkg = require('../package.json')
const cfg = require('../d2.config.js')

module.exports = {
    plugins: [
        [
            'minify-replace',
            {
                replacements: [
                    {
                        identifierName: '__VERSION__',
                        replacement: {
                            type: 'stringLiteral',
                            value: pkg.version,
                        },
                    },
                    {
                        identifierName: '__APP_HUB_ID__',
                        replacement: {
                            type: 'stringLiteral',
                            value: cfg.id || '',
                        },
                    }
                ],
            },
        ],
    ],
}
