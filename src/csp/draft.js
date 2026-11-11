// Pure helpers for the CSP override editor. The editor works on an
// "editable" document: the stored override with any report-only draft folded
// into the enforced part, so pending (unsaved or drafted) changes show as
// differences against the stored enforced policy.
import { ENFORCE, ENTRYPOINT_ALL, REPORT_ONLY_EXEMPT } from './constants.js'
import { isUnsafeSource } from './validation.js'

const unique = (values) => [...new Set(values)]

export const baseSourceKey = (directive, source) => `${directive} ${source}`

const emptyDraft = () => ({
    enabled: false,
    expiresAt: null,
    add: {},
    disabledBaseSources: [],
})

const normalizeAdd = (add = {}) => {
    const result = {}
    Object.entries(add || {}).forEach(([directive, values]) => {
        const cleaned = unique((values || []).filter(Boolean))
        if (cleaned.length > 0) {
            result[directive] = cleaned
        }
    })
    return result
}

const mergeAdd = (left = {}, right = {}) => {
    const result = { ...normalizeAdd(left) }
    Object.entries(normalizeAdd(right)).forEach(([directive, values]) => {
        result[directive] = unique([...(result[directive] || []), ...values])
    })
    return result
}

const subtractAdd = (left = {}, right = {}) => {
    const result = {}
    Object.entries(normalizeAdd(left)).forEach(([directive, values]) => {
        const remaining = values.filter(
            (value) => !(right[directive] || []).includes(value)
        )
        if (remaining.length > 0) {
            result[directive] = remaining
        }
    })
    return result
}

const normalizeEntrypoint = (entry = {}) => ({
    enforcementMode: entry.enforcementMode || ENFORCE,
    enforced: {
        add: normalizeAdd(entry.enforced?.add),
        disabledBaseSources: unique(entry.enforced?.disabledBaseSources || []),
    },
    reportOnlyDraft: {
        ...emptyDraft(),
        ...(entry.reportOnlyDraft || {}),
        add: normalizeAdd(entry.reportOnlyDraft?.add),
        disabledBaseSources: unique(
            entry.reportOnlyDraft?.disabledBaseSources || []
        ),
    },
})

export const emptyEntrypoint = () => normalizeEntrypoint({})

/** The stored override as saved, with drafts kept separate. */
export const toStored = (override) => {
    const entrypoints = {}
    Object.entries(override?.entrypoints || {}).forEach(([ep, entry]) => {
        entrypoints[ep] = normalizeEntrypoint(entry)
    })
    return {
        enabled: override ? override.enabled !== false : true,
        approvalNote: override?.approvalNote || '',
        entrypoints,
    }
}

/** The editor state: stored enforced policy plus any enabled draft. */
export const toEditable = (override) => {
    const stored = toStored(override)
    const entrypoints = {}
    Object.entries(stored.entrypoints).forEach(([ep, entry]) => {
        const draft = entry.reportOnlyDraft
        entrypoints[ep] = {
            ...entry,
            enforced: draft.enabled
                ? {
                      add: mergeAdd(entry.enforced.add, draft.add),
                      disabledBaseSources: unique([
                          ...entry.enforced.disabledBaseSources,
                          ...draft.disabledBaseSources,
                      ]),
                  }
                : entry.enforced,
            reportOnlyDraft: emptyDraft(),
        }
    })
    return { ...stored, entrypoints }
}

export const getEntrypoint = (doc, ep) =>
    doc.entrypoints[ep] || emptyEntrypoint()

const updateEntrypoint = (doc, ep, update) => ({
    ...doc,
    entrypoints: {
        ...doc.entrypoints,
        [ep]: update(getEntrypoint(doc, ep)),
    },
})

export const addSource = (doc, ep, { directive, source }) =>
    updateEntrypoint(doc, ep, (entry) => ({
        ...entry,
        enforced: {
            ...entry.enforced,
            add: mergeAdd(entry.enforced.add, { [directive]: [source] }),
        },
    }))

export const removeSource = (doc, ep, { directive, source }) =>
    updateEntrypoint(doc, ep, (entry) => ({
        ...entry,
        enforced: {
            ...entry.enforced,
            add: subtractAdd(entry.enforced.add, { [directive]: [source] }),
        },
    }))

export const hasSource = (doc, ep, { directive, source }) =>
    (getEntrypoint(doc, ep).enforced.add[directive] || []).includes(source)

export const setBaseSourceEnabled = (doc, ep, { directive, source, enabled }) =>
    updateEntrypoint(doc, ep, (entry) => {
        const key = baseSourceKey(directive, source)
        const others = entry.enforced.disabledBaseSources.filter(
            (item) => item !== key
        )
        return {
            ...entry,
            enforced: {
                ...entry.enforced,
                disabledBaseSources: enabled ? others : [...others, key],
            },
        }
    })

export const isBaseSourceDisabled = (doc, ep, { directive, source }) =>
    getEntrypoint(doc, ep).enforced.disabledBaseSources.includes(
        baseSourceKey(directive, source)
    )

export const setEnforcementMode = (doc, ep, mode) =>
    updateEntrypoint(doc, ep, (entry) => ({ ...entry, enforcementMode: mode }))

const isEmptyEntrypoint = (entry) =>
    entry.enforcementMode === ENFORCE &&
    Object.keys(entry.enforced.add).length === 0 &&
    entry.enforced.disabledBaseSources.length === 0 &&
    !entry.reportOnlyDraft.enabled

const pruneEntrypoints = (entrypoints) => {
    const result = {}
    Object.entries(entrypoints).forEach(([ep, entry]) => {
        if (!isEmptyEntrypoint(entry)) {
            result[ep] = entry
        }
    })
    return result
}

/** PUT body for "Apply & Save": editor becomes the enforced policy, drafts end. */
export const buildSaveBody = (
    editable,
    { confirmUnsafe = false, confirmExempt = false } = {}
) => {
    const entrypoints = {}
    Object.entries(editable.entrypoints).forEach(([ep, entry]) => {
        entrypoints[ep] = { ...entry, reportOnlyDraft: emptyDraft() }
    })
    return {
        enabled: editable.enabled,
        approvalNote: editable.approvalNote || null,
        confirmUnsafe,
        confirmExempt,
        entrypoints: pruneEntrypoints(entrypoints),
    }
}

/**
 * Per entrypoint difference between the editor and the stored enforced
 * policy. Only additions and newly removed base sources can run as a draft;
 * everything else needs Apply & Save.
 */
export const diffEntrypoints = (stored, editable) => {
    const eps = unique([
        ...Object.keys(stored.entrypoints),
        ...Object.keys(editable.entrypoints),
    ])
    const result = {}
    eps.forEach((ep) => {
        const before = getEntrypoint(stored, ep)
        const after = getEntrypoint(editable, ep)
        const added = subtractAdd(after.enforced.add, before.enforced.add)
        const removed = subtractAdd(before.enforced.add, after.enforced.add)
        const disabled = after.enforced.disabledBaseSources.filter(
            (key) => !before.enforced.disabledBaseSources.includes(key)
        )
        const reenabled = before.enforced.disabledBaseSources.filter(
            (key) => !after.enforced.disabledBaseSources.includes(key)
        )
        const modeChanged = before.enforcementMode !== after.enforcementMode
        if (
            Object.keys(added).length ||
            Object.keys(removed).length ||
            disabled.length ||
            reenabled.length ||
            modeChanged
        ) {
            result[ep] = { added, removed, disabled, reenabled, modeChanged }
        }
    })
    return result
}

export const isDirty = (stored, editable) =>
    Object.keys(diffEntrypoints(stored, editable)).length > 0 ||
    (stored.approvalNote || '') !== (editable.approvalNote || '') ||
    stored.enabled !== editable.enabled

/** Changes that a draft cannot express (they apply on Apply & Save only). */
export const undraftableChanges = (stored, editable) => {
    const result = []
    Object.entries(diffEntrypoints(stored, editable)).forEach(([ep, diff]) => {
        Object.entries(diff.removed).forEach(([directive, values]) =>
            values.forEach((value) =>
                result.push({ ep, kind: 'removed', directive, value })
            )
        )
        diff.reenabled.forEach((key) =>
            result.push({ ep, kind: 'reenabled', value: key })
        )
        if (diff.modeChanged) {
            result.push({ ep, kind: 'mode' })
        }
    })
    return result
}

export const hasDraftableChanges = (stored, editable) =>
    Object.values(diffEntrypoints(stored, editable)).some(
        (diff) => Object.keys(diff.added).length > 0 || diff.disabled.length > 0
    )

/**
 * PUT body for "Test Draft" (expiresAt set: additions also enforced until
 * then) or "Run Report-Only Audit" (expiresAt null: candidate policy only in
 * Content-Security-Policy-Report-Only). The stored enforced policy is kept.
 */
export const buildDraftBody = (
    stored,
    editable,
    { expiresAt = null, confirmUnsafe = false, confirmExempt = false } = {}
) => {
    const diffs = diffEntrypoints(stored, editable)
    const eps = unique([
        ...Object.keys(stored.entrypoints),
        ...Object.keys(diffs),
    ])
    const entrypoints = {}
    eps.forEach((ep) => {
        const entry = getEntrypoint(stored, ep)
        const diff = diffs[ep]
        const draftable =
            diff && (Object.keys(diff.added).length || diff.disabled.length)
        entrypoints[ep] = {
            ...entry,
            reportOnlyDraft: draftable
                ? {
                      enabled: true,
                      expiresAt,
                      add: diff.added,
                      disabledBaseSources: diff.disabled,
                  }
                : emptyDraft(),
        }
    })
    return {
        enabled: stored.enabled,
        approvalNote: editable.approvalNote || stored.approvalNote || null,
        confirmUnsafe,
        confirmExempt,
        entrypoints: pruneEntrypoints(entrypoints),
    }
}

/** PUT body that ends any running draft and keeps the stored policy. */
export const buildStopDraftBody = (stored, flags = {}) =>
    buildSaveBody(stored, flags)

/** Unsafe tokens in a PUT body, as "<entrypoint> <directive> <token>". */
export const unsafeTokensOf = (body) => {
    const tokens = []
    Object.entries(body.entrypoints || {}).forEach(([ep, entry]) => {
        const adds = [entry.enforced?.add, entry.reportOnlyDraft?.add]
        adds.forEach((add) =>
            Object.entries(add || {}).forEach(([directive, values]) =>
                values
                    .filter((value) => isUnsafeSource(value, directive))
                    .forEach((value) =>
                        tokens.push(`${ep} ${directive} ${value}`)
                    )
            )
        )
    })
    return unique(tokens)
}

/** Splits "<entrypoint> <directive> <token>" (unsafeTokens, baseUnsafeTokens). */
export const parseToken = (token) => {
    const [entrypoint, directive, ...rest] = (token || '').split(' ')
    const value = rest.join(' ')
    return entrypoint && directive && value
        ? { entrypoint, directive, value }
        : null
}

export const exemptEntrypointsOf = (body) =>
    Object.entries(body.entrypoints || {})
        .filter(([, entry]) => entry.enforcementMode === REPORT_ONLY_EXEMPT)
        .map(([ep]) => ep)

/** Draft additions for an entrypoint inherited from the "*" entry. */
export const inheritedAdd = (doc, ep) =>
    ep === ENTRYPOINT_ALL ? {} : getEntrypoint(doc, ENTRYPOINT_ALL).enforced.add
