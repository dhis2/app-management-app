import i18n from '@dhis2/d2-i18n'

export const CSP_API = 'security/csp'

export const ENTRYPOINT_ALL = '*'
export const ENTRYPOINT_ORDER = [ENTRYPOINT_ALL, 'app', 'plugin', 'worker']

export const ENFORCE = 'ENFORCE'
export const REPORT_ONLY_EXEMPT = 'REPORT_ONLY_EXEMPT'

export const TEST_DRAFT_MINUTES = 15
export const VIOLATION_POLL_MS = 5000

// Directives the editor always offers, in display order. The server's
// overridableDirectives list decides which of them are really editable.
export const EDITOR_DIRECTIVES = [
    'connect-src',
    'img-src',
    'frame-src',
    'font-src',
    'style-src',
    'media-src',
    'script-src',
]

// Shown read-only; the server never lets an override change them.
export const HARDENING_DIRECTIVES = [
    'default-src',
    'object-src',
    'base-uri',
    'frame-ancestors',
]

export const entrypointLabel = (entrypoint) => {
    switch (entrypoint) {
        case ENTRYPOINT_ALL:
            return i18n.t('All entrypoints (*)')
        case 'app':
            return i18n.t('App (index.html)')
        case 'plugin':
            return i18n.t('Plugin (plugin.html)')
        case 'worker':
            return i18n.t('Service worker')
        default:
            return entrypoint
    }
}
