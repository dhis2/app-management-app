const config = {
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!<rootDir>/node_modules/',
    ],
    moduleNameMapper: {
        'react-markdown': '<rootDir>/src/test-utils/react-markdown-mock.jsx',
        '\\.(css|scss)$': 'identity-obj-proxy',
    },
    coverageThreshold: {
        global: {
            // TODO: The following should be ~50%
            branches: 10,

            // TODO: The following should be ~75%
            functions: 20,
            lines: 20,
            statements: 20,
        },
    },
}

module.exports = config
