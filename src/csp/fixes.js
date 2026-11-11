// Turns a violation report row into the override that would allow it: the
// directive and value the report calls for. Locked directives and values the
// server rejects are never proposed.
import i18n from '@dhis2/d2-i18n'
import { ENTRYPOINT_ALL } from './constants.js'
import { parseToken } from './draft.js'
import { isUnsafeSource, validateSource } from './validation.js'

// Server defaults, used when no app detail (with its own lists) is at hand.
export const DEFAULT_OVERRIDABLE_DIRECTIVES = [
    'connect-src',
    'img-src',
    'frame-src',
    'child-src',
    'font-src',
    'style-src',
    'media-src',
    'worker-src',
    'script-src',
    'form-action',
]
export const DEFAULT_LOCKED_DIRECTIVES = [
    'default-src',
    'object-src',
    'base-uri',
    'frame-ancestors',
    'upgrade-insecure-requests',
    'report-uri',
    'report-to',
]

const KIND_TO_SCRIPT_VALUE = {
    EVAL: "'unsafe-eval'",
    WASM_EVAL: "'wasm-unsafe-eval'",
    INLINE: "'unsafe-inline'",
    DATA: 'data:',
    BLOB: 'blob:',
}

/** script-src-elem / script-src-attr report under the directive an override can edit. */
export const baseDirective = (directive = '') =>
    directive.replace(/-(elem|attr)$/, '')

const notFixable = (reason) => ({ fix: null, reason })

/**
 * Checks a proposed { entrypoint, directive, value } against the hard locks and
 * the server's source rules. Returns { fix } or { fix: null, reason }.
 */
export const checkFix = (
    { entrypoint, directive, value },
    {
        overridable = DEFAULT_OVERRIDABLE_DIRECTIVES,
        locked = DEFAULT_LOCKED_DIRECTIVES,
        entrypoints,
        httpsOnly = false,
    } = {}
) => {
    if (locked.includes(directive) || !overridable.includes(directive)) {
        return notFixable(
            i18n.t('{{directive}} is locked', {
                interpolation: { escapeValue: false },
                directive,
            })
        )
    }
    const problem = validateSource(directive, value, { httpsOnly })
    if (problem) {
        return notFixable(problem.message)
    }
    const target =
        entrypoint && (!entrypoints || entrypoints.includes(entrypoint))
            ? entrypoint
            : ENTRYPOINT_ALL
    return {
        fix: {
            entrypoint: target,
            directive,
            value,
            unsafe: isUnsafeSource(value, directive),
        },
        reason: null,
    }
}

/**
 * Returns { fix: { entrypoint, directive, value, unsafe } } or { fix: null, reason }.
 * `entrypoints` are the entrypoints the app offers; others fall back to "*".
 */
export const fixForViolation = (violation, options = {}) => {
    if (!violation || violation.appKey === '_platform') {
        return notFixable(i18n.t('Not an app page'))
    }
    const reported = baseDirective(
        violation.suggestedDirective || violation.effectiveDirective
    )
    let directive = reported
    let value = null

    if (violation.suggestable && violation.suggestedSource) {
        value = violation.suggestedSource
    } else if (KIND_TO_SCRIPT_VALUE[violation.violationKind]) {
        if (reported !== 'script-src') {
            return notFixable(
                i18n.t('Only script-src takes keywords such as {{value}}', {
                    interpolation: { escapeValue: false },
                    value: KIND_TO_SCRIPT_VALUE[violation.violationKind],
                })
            )
        }
        directive = 'script-src'
        value = KIND_TO_SCRIPT_VALUE[violation.violationKind]
    } else {
        return notFixable(i18n.t('No override can allow this'))
    }

    return checkFix(
        { entrypoint: violation.entrypoint, directive, value },
        options
    )
}

export const fixKey = ({ entrypoint, directive, value }) =>
    `${entrypoint} ${directive} ${value}`

/**
 * Distinct fixes for a list of rows, with the blocked count they cover,
 * most-blocked first. Report-only rows are included only when asked.
 */
export const groupFixes = (rows, options = {}) => {
    const groups = new Map()
    rows.filter(
        (row) => options.includeReportOnly || row.disposition !== 'report'
    ).forEach((row) => {
        const { fix } = fixForViolation(row, options)
        if (!fix) {
            return
        }
        const key = fixKey(fix)
        const group = groups.get(key) || { ...fix, count: 0, rows: 0 }
        group.count += row.count || 1
        group.rows += 1
        groups.set(key, group)
    })
    return [...groups.values()].sort((a, b) => b.count - a.count)
}

/** URL query value for prefilling fixes in the CSP tab (?fix=...). */
export const encodeFix = (fix) => fixKey(fix)

export const decodeFix = parseToken
