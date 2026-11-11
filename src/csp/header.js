// Parse a Content-Security-Policy header string and find the sources it has
// that the current effective policy lacks (the "paste" helper).

/** Parses "a b c; d e" into { a: ['b', 'c'], d: ['e'] }. First directive wins. */
export const parseCspHeader = (header) => {
    const result = {}
    let text = (header || '').trim()
    // Accept a pasted "Content-Security-Policy: ..." line too.
    text = text.replace(/^content-security-policy(-report-only)?\s*:\s*/i, '')
    text.split(';').forEach((part) => {
        const tokens = part.trim().split(/\s+/).filter(Boolean)
        if (tokens.length === 0) {
            return
        }
        const directive = tokens[0].toLowerCase()
        if (!(directive in result)) {
            result[directive] = tokens.slice(1)
        }
    })
    return result
}

/**
 * Sources in the pasted header that are missing from the effective header.
 * Returns { candidates: [{ directive, source }], ignored: [directive] } where
 * ignored lists pasted directives the editor cannot change.
 */
export const findMissingSources = (pasted, effective, editableDirectives) => {
    const pastedPolicy = parseCspHeader(pasted)
    const effectivePolicy = parseCspHeader(effective)
    const candidates = []
    const ignored = []
    Object.entries(pastedPolicy).forEach(([directive, sources]) => {
        if (!editableDirectives.includes(directive)) {
            const known = effectivePolicy[directive] || []
            if (sources.some((source) => !known.includes(source))) {
                ignored.push(directive)
            }
            return
        }
        const known = effectivePolicy[directive] || []
        sources
            .filter((source) => !known.includes(source))
            .forEach((source) => candidates.push({ directive, source }))
    })
    return { candidates, ignored }
}
