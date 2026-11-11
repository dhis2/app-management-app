// Client-side hints that mirror the server's CSP override locks. The server
// validation (POST .../validate and PUT) stays authoritative; these hints only
// give fast feedback while typing.
import i18n from '@dhis2/d2-i18n'

const SCRIPT_KEYWORDS = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "'wasm-unsafe-eval'",
    "'unsafe-hashes'",
    "'strict-dynamic'",
]
const UNSAFE_KEYWORDS = [
    "'unsafe-inline'",
    "'unsafe-eval'",
    "'wasm-unsafe-eval'",
    "'unsafe-hashes'",
]
const UNSAFE_SCHEME_SOURCES = ['*', 'data:', 'http:']
const DATA_BLOB_DIRECTIVES = ['img-src', 'font-src', 'media-src', 'worker-src']
const WILDCARD_DIRECTIVES = ['img-src', 'connect-src']
const ORIGIN_SCHEMES = ['https', 'http', 'wss', 'ws']
const INSECURE_SCHEMES = ['http', 'ws']

const HASH_PATTERN = /^'sha(256|384|512)-[A-Za-z0-9+/_-]+={0,2}'$/
const SCHEME_ONLY_PATTERN = /^[a-z][a-z0-9+.-]*:$/i
const ORIGIN_PATTERN = /^([a-z][a-z0-9+.-]*):\/\/(.*)$/i
const HOST_LABEL_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i

const error = (code, message) => ({ code, message })

const validateHost = (directive, hostAndPort) => {
    const portMatch = hostAndPort.match(/^(.*):(\d+)$/)
    let host = hostAndPort
    if (portMatch) {
        host = portMatch[1]
        const port = Number(portMatch[2])
        if (port < 1 || port > 65535) {
            return error('INVALID_SOURCE', i18n.t('The port is not valid'))
        }
    }

    let labels = host.split('.')
    if (host.startsWith('*.')) {
        if (!WILDCARD_DIRECTIVES.includes(directive)) {
            return error(
                'WILDCARD_NOT_ALLOWED',
                i18n.t(
                    'Wildcard hosts (https://*.domain) are only allowed in img-src and connect-src',
                    {
                        interpolation: { escapeValue: false },
                        nsSeparator: '-:-',
                    }
                )
            )
        }
        labels = labels.slice(1)
        if (labels.length < 2) {
            return error(
                'WILDCARD_NOT_ALLOWED',
                i18n.t(
                    'A wildcard needs at least two labels after *., for example https://*.example.org',
                    {
                        interpolation: { escapeValue: false },
                        nsSeparator: '-:-',
                    }
                )
            )
        }
    }

    if (labels.some((label) => label.includes('*'))) {
        return error(
            'WILDCARD_NOT_ALLOWED',
            i18n.t('A wildcard is only allowed as the first label (*.)')
        )
    }
    if (!labels.every((label) => HOST_LABEL_PATTERN.test(label))) {
        return error('INVALID_SOURCE', i18n.t('The host name is not valid'))
    }
    return null
}

const validateOrigin = (directive, value, { httpsOnly }) => {
    const match = value.match(ORIGIN_PATTERN)
    if (!match) {
        return error(
            'INVALID_SOURCE',
            i18n.t(
                'Use a bare origin such as https://tiles.example.org (scheme://host[:port])',
                { interpolation: { escapeValue: false }, nsSeparator: '-:-' }
            )
        )
    }
    const scheme = match[1].toLowerCase()
    const rest = match[2]

    if (!ORIGIN_SCHEMES.includes(scheme)) {
        return error(
            'INVALID_SOURCE',
            i18n.t('Only https, http, wss and ws origins are allowed')
        )
    }
    if (rest.includes('@')) {
        return error(
            'INVALID_SOURCE',
            i18n.t('User names or passwords are not allowed in a source')
        )
    }
    if (/[/?#]/.test(rest)) {
        return error(
            'PATH_NOT_ALLOWED',
            i18n.t(
                'Only bare origins (scheme://host[:port]) are allowed, remove the path',
                { interpolation: { escapeValue: false }, nsSeparator: '-:-' }
            )
        )
    }
    if (rest === '') {
        return error('INVALID_SOURCE', i18n.t('The host name is missing'))
    }
    if (httpsOnly && INSECURE_SCHEMES.includes(scheme)) {
        return error(
            'INSECURE_SCHEME',
            i18n.t('This server uses HTTPS, so http:// and ws:// are blocked', {
                interpolation: { escapeValue: false },
                nsSeparator: '-:-',
            })
        )
    }
    return validateHost(directive, rest)
}

const validateScriptKeyword = (value) => {
    if (value.toLowerCase().startsWith("'nonce-")) {
        return error(
            'KEYWORD_NOT_ALLOWED',
            i18n.t('Nonces are not supported, the server does not issue one')
        )
    }
    if (SCRIPT_KEYWORDS.includes(value.toLowerCase())) {
        return null
    }
    if (HASH_PATTERN.test(value)) {
        return null
    }
    return error(
        'KEYWORD_NOT_ALLOWED',
        i18n.t('Unknown keyword {{value}}', {
            interpolation: { escapeValue: false },
            value,
        })
    )
}

/**
 * Returns null when the value looks acceptable for the directive, or
 * { code, message } using the server's error codes.
 */
export const validateSource = (directive, rawValue, { httpsOnly } = {}) => {
    const value = (rawValue || '').trim()
    if (!value) {
        return error('EMPTY', i18n.t('Enter a source'))
    }
    // eslint-disable-next-line no-control-regex
    if (/[\s;,'"\u0000-\u001f]/.test(value.replace(/^'.*'$/, 'x'))) {
        return error(
            'INVALID_CHARACTERS',
            i18n.t('Enter one source at a time, without spaces, ; or ,')
        )
    }

    const isScript = directive === 'script-src'

    if (value.startsWith("'")) {
        if (!isScript) {
            return error(
                'KEYWORD_NOT_ALLOWED',
                i18n.t('Keywords are only allowed in script-src')
            )
        }
        return validateScriptKeyword(value)
    }

    if (value === '*') {
        return isScript
            ? null
            : error(
                  'WILDCARD_NOT_ALLOWED',
                  i18n.t('A bare * allows every host and is not allowed here')
              )
    }

    if (SCHEME_ONLY_PATTERN.test(value)) {
        const scheme = value.toLowerCase()
        if (isScript) {
            if (httpsOnly && scheme === 'http:') {
                return error(
                    'INSECURE_SCHEME',
                    i18n.t('This server uses HTTPS, so http: is blocked', {
                        interpolation: { escapeValue: false },
                        nsSeparator: '-:-',
                    })
                )
            }
            return null
        }
        if (
            (scheme === 'data:' || scheme === 'blob:') &&
            DATA_BLOB_DIRECTIVES.includes(directive)
        ) {
            return null
        }
        return error(
            'WILDCARD_NOT_ALLOWED',
            i18n.t(
                'Bare schemes such as https: allow every host and are not allowed here',
                { interpolation: { escapeValue: false }, nsSeparator: '-:-' }
            )
        )
    }

    return validateOrigin(directive, value, { httpsOnly })
}

/** True for sources that need an explicit confirmUnsafe on save. */
export const isUnsafeSource = (value) => {
    const normalized = (value || '').trim().toLowerCase()
    return (
        UNSAFE_KEYWORDS.includes(normalized) ||
        UNSAFE_SCHEME_SOURCES.includes(normalized) ||
        normalized.startsWith('http://')
    )
}

/** Explains the risk of an unsafe token in one sentence. */
export const unsafeTokenRisk = (value) => {
    const normalized = (value || '').trim().toLowerCase()
    switch (normalized) {
        case "'unsafe-inline'":
            return i18n.t(
                'Runs any inline script, so an injected <script> tag (XSS) executes.'
            )
        case "'unsafe-eval'":
            return i18n.t(
                'Allows eval() and new Function(), which turns string injection into code execution.'
            )
        case "'wasm-unsafe-eval'":
            return i18n.t('Allows compiling and running WebAssembly code.')
        case "'unsafe-hashes'":
            return i18n.t(
                'Allows inline event handlers (onclick=...) that match a hash.'
            )
        case '*':
            return i18n.t('Allows loading from any host on the internet.')
        case 'data:':
            return i18n.t(
                'Allows data: URLs, which attackers can use to smuggle content.',
                { interpolation: { escapeValue: false }, nsSeparator: '-:-' }
            )
        case 'http:':
            return i18n.t(
                'Allows plain HTTP from any host, which can be tampered with in transit.'
            )
        default:
            if (normalized.startsWith('http://')) {
                return i18n.t(
                    'Plain HTTP can be tampered with in transit; prefer https://.',
                    {
                        interpolation: { escapeValue: false },
                        nsSeparator: '-:-',
                    }
                )
            }
            return ''
    }
}
