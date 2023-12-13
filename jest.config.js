const config = {
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!<rootDir>/node_modules/',
    ],
    coverageThreshold: {
        global: {
            // TODO: The following should be 50
            branches: 0,

            // TODO: The following should be 75
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
}

module.exports = config
