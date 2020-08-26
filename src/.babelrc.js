const pkg = require('../package.json')
const version = pkg.version

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
                            value: version,
                        },
                    },
                ],
            },
        ],
    ],
}
