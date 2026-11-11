import { useAlert, useDataEngine, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CenteredContent,
    Checkbox,
    CircularLoader,
    InputField,
    NoticeBox,
    SegmentedControl,
    SwitchField,
} from '@dhis2/ui'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import {
    CSP_API,
    EDITOR_DIRECTIVES,
    ENFORCE,
    ENTRYPOINT_ALL,
    ENTRYPOINT_ORDER,
    HARDENING_DIRECTIVES,
    REPORT_ONLY_EXEMPT,
    TEST_DRAFT_MINUTES,
    VIOLATION_POLL_MS,
    entrypointLabel,
} from '../../csp/constants.js'
import {
    addSourceTo,
    buildDraftBody,
    buildSaveBody,
    buildStopDraftBody,
    diffEntrypoints,
    exemptEntrypointsOf,
    getEntrypoint,
    hasDraftableChanges,
    hasSource,
    inheritedAdd,
    isBaseSourceDisabled,
    isDirty,
    parseToken,
    pairedEntrypoints,
    removeSourceFrom,
    setBaseSourceEnabled,
    setEnforcementMode,
    toEditable,
    toStored,
    undraftableChanges,
    unsafeTokensOf,
} from '../../csp/draft.js'
import { checkFix, decodeFix, fixForViolation } from '../../csp/fixes.js'
import { parseCspHeader } from '../../csp/header.js'
import { unsafeTokenRisk } from '../../csp/validation.js'
import { CspBadges } from '../CspBadges/CspBadges.jsx'
import { BaseSources, Hardening } from './BaseSources.jsx'
import styles from './CspPolicy.module.css'
import { DirectiveEditor } from './DirectiveEditor.jsx'
import { EffectiveHeader } from './EffectiveHeader.jsx'
import {
    ConfirmExemptModal,
    ConfirmResetModal,
    ConfirmUnsafeModal,
} from './Modals.jsx'
import { ViolationsTable } from './ViolationsTable.jsx'

const summaryQuery = {
    summary: { resource: `${CSP_API}/apps` },
}

const Section = ({ title, description, children, dataTest }) => (
    <section className={styles.cspSection} data-test={dataTest}>
        <h3 className={styles.cspSectionTitle}>{title}</h3>
        {description && <p className={styles.muted}>{description}</p>}
        {children}
    </section>
)

Section.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    dataTest: PropTypes.string,
    description: PropTypes.string,
}

const useLatest = (value) => {
    const ref = useRef(value)
    ref.current = value
    return ref
}

const DraftStatus = ({ stored, effective, onStop, busy }) => {
    const drafts = Object.entries(stored.entrypoints).filter(
        ([, entry]) => entry.reportOnlyDraft.enabled
    )
    if (drafts.length === 0) {
        return null
    }
    const now = moment()
    const testing = drafts.filter(
        ([, entry]) =>
            entry.reportOnlyDraft.expiresAt &&
            moment(entry.reportOnlyDraft.expiresAt).isAfter(now)
    )
    const until = testing
        .map(([, entry]) => moment(entry.reportOnlyDraft.expiresAt))
        .sort((a, b) => b.valueOf() - a.valueOf())[0]
    const eps = drafts.map(([ep]) => entrypointLabel(ep)).join(', ')
    const testActive =
        testing.length > 0 ||
        Object.values(effective || {}).some((entry) => entry?.draftTestActive)

    return (
        <NoticeBox
            warning
            title={
                testActive
                    ? i18n.t(
                          'Draft test running until {{time}} ({{relative}})',
                          {
                              interpolation: { escapeValue: false },
                              time: until ? until.format('HH:mm') : '',
                              relative: until ? until.fromNow() : '',
                          }
                      )
                    : i18n.t('Report-only audit running')
            }
            className={styles.notice}
            dataTest="csp-draft-status"
        >
            <p className={styles.noticeText}>
                {testActive
                    ? i18n.t(
                          'The draft sources are enforced now for {{eps}}, without a restart. Reload the app in another tab and watch the violations below, then Apply & Save or stop the draft. After expiry the draft only reports.',
                          { interpolation: { escapeValue: false }, eps }
                      )
                    : i18n.t(
                          'The candidate policy for {{eps}} is sent as Content-Security-Policy-Report-Only next to the enforced policy. Violations it would cause show with disposition Report-only.',
                          { interpolation: { escapeValue: false }, eps }
                      )}
            </p>
            <Button
                small
                onClick={onStop}
                disabled={busy}
                dataTest="csp-stop-draft"
            >
                {i18n.t('Stop draft')}
            </Button>
        </NoticeBox>
    )
}

DraftStatus.propTypes = {
    stored: PropTypes.object.isRequired,
    onStop: PropTypes.func.isRequired,
    busy: PropTypes.bool,
    effective: PropTypes.object,
}

const CspEditor = ({ appKey, appName, detail, settings, refetchDetail }) => {
    const engine = useDataEngine()
    const successAlert = useAlert(({ message }) => message, { success: true })
    const errorAlert = useAlert(({ message }) => message, { critical: true })

    const override = detail.override || null
    const stored = useMemo(() => toStored(override), [override])
    const [editable, setEditable] = useState(() => toEditable(override))
    const keepEditorRef = useRef(false)
    useEffect(() => {
        if (keepEditorRef.current) {
            keepEditorRef.current = false
            return
        }
        setEditable(toEditable(override))
    }, [override])

    const availableEntrypoints = ENTRYPOINT_ORDER.filter(
        (ep) =>
            ep === ENTRYPOINT_ALL ||
            detail.entrypoints?.[ep] ||
            stored.entrypoints[ep]
    )
    const [entrypoint, setEntrypoint] = useState(ENTRYPOINT_ALL)
    // The worker entrypoint is only listed for apps that ship service-worker.js.
    const hasWorker = !!detail.entrypoints?.worker
    const [pairWorker, setPairWorker] = useState(hasWorker)
    const targetsFor = (ep) => pairedEntrypoints(ep, hasWorker && pairWorker)

    const overridable = detail.overridableDirectives || EDITOR_DIRECTIVES
    const lockedDirectives = detail.lockedDirectives || HARDENING_DIRECTIVES
    const extraDirectives = overridable.filter(
        (directive) =>
            !EDITOR_DIRECTIVES.includes(directive) &&
            Object.values(editable.entrypoints).some(
                (entry) => entry.enforced.add[directive]?.length
            )
    )
    const editorDirectives = [
        ...EDITOR_DIRECTIVES.filter((directive) =>
            overridable.includes(directive)
        ),
        ...extraDirectives,
    ]
    const httpsOnly = !!settings?.httpsOnly

    const [busy, setBusy] = useState(false)
    const [submitErrors, setSubmitErrors] = useState([])
    const [unsafePrompt, setUnsafePrompt] = useState(null)
    const [exemptPrompt, setExemptPrompt] = useState(null)
    const [resetPrompt, setResetPrompt] = useState(false)
    const [showAllowedSuggestions, setShowAllowedSuggestions] = useState(false)

    // Server dry run for errors and a header preview of the unsaved state.
    const saveBody = useMemo(() => buildSaveBody(editable), [editable])
    const [debouncedBody] = useDebounce(saveBody, 500)
    const [validation, setValidation] = useState(null)
    useEffect(() => {
        let cancelled = false
        engine
            .mutate({
                resource: `${CSP_API}/apps/${appKey}/validate`,
                type: 'create',
                data: debouncedBody,
            })
            .then((result) => !cancelled && setValidation(result))
            .catch(
                (error) =>
                    !cancelled &&
                    setValidation({
                        valid: false,
                        errors: error.details?.errors || [
                            { message: error.message },
                        ],
                    })
            )
        return () => {
            cancelled = true
        }
    }, [debouncedBody, appKey, engine])

    // Violation reports, polled while the tab is open.
    const reportsQuery = useMemo(
        () => ({
            reports: { resource: `${CSP_API}/apps/${appKey}/reports` },
        }),
        [appKey]
    )
    const reports = useDataQuery(reportsQuery)
    const refetchReports = useLatest(reports.refetch)
    useEffect(() => {
        const timer = setInterval(
            () => refetchReports.current(),
            VIOLATION_POLL_MS
        )
        return () => clearInterval(timer)
    }, [refetchReports])
    const violations =
        reports.data?.reports?.violations || detail.recentViolations || []

    const dirty = isDirty(stored, editable)
    const diffs = diffEntrypoints(stored, editable)
    const draftable = hasDraftableChanges(stored, editable)
    const notDraftable = undraftableChanges(stored, editable)
    const serverErrors =
        submitErrors.length > 0 ? submitErrors : validation?.errors || []
    const invalid = validation?.valid === false
    const current = getEntrypoint(editable, entrypoint)
    const inherited = inheritedAdd(editable, entrypoint)
    const isExempt = current.enforcementMode === REPORT_ONLY_EXEMPT
    const effective = detail.effective?.[entrypoint]
    const preview = validation?.effective?.[entrypoint]
    const hasRunningDraft = Object.values(stored.entrypoints).some(
        (entry) => entry.reportOnlyDraft.enabled
    )

    const put = async (body, { success, keepEditor, onDone }) => {
        setBusy(true)
        try {
            await engine.mutate({
                resource: `${CSP_API}/apps/${appKey}`,
                type: 'replace',
                data: body,
            })
            setSubmitErrors([])
            setUnsafePrompt(null)
            successAlert.show({ message: success })
            onDone?.()
            keepEditorRef.current = !!keepEditor
            await refetchDetail()
            refetchReports.current()
        } catch (error) {
            const details = error.details || {}
            const errors = details.errors || []
            if (
                errors.some((item) => item.code === 'CONFIRM_UNSAFE_REQUIRED')
            ) {
                setUnsafePrompt({
                    tokens: details.unsafeTokens || unsafeTokensOf(body),
                    body: { ...body, confirmUnsafe: true },
                    options: { success, keepEditor, onDone },
                })
                return
            }
            setUnsafePrompt(null)
            setSubmitErrors(errors)
            errorAlert.show({
                message: i18n.t(
                    'Could not save the CSP override: {{message}}',
                    {
                        interpolation: { escapeValue: false },
                        message:
                            errors[0]?.message ||
                            details.message ||
                            error.message,
                        nsSeparator: '-:-',
                    }
                ),
            })
        } finally {
            setBusy(false)
        }
    }

    const submit = async (body, options) => {
        const tokens = unsafeTokensOf(body)
        const known = override?.unsafeTokens || []
        const fresh = tokens.filter((token) => !known.includes(token))
        const finalBody = {
            ...body,
            confirmUnsafe: tokens.length > 0,
            confirmExempt:
                body.confirmExempt || exemptEntrypointsOf(body).length > 0,
        }
        if (fresh.length > 0) {
            setUnsafePrompt({ tokens, body: finalBody, options })
            return
        }
        await put(finalBody, options)
    }

    const update = (next) => {
        setSubmitErrors([])
        setEditable(next)
    }

    const handleApply = () =>
        submit(buildSaveBody(editable), {
            success: i18n.t(
                'CSP override saved. It applies on the next page load, no restart needed.'
            ),
        })

    const handleTestDraft = () =>
        submit(
            buildDraftBody(stored, editable, {
                expiresAt: moment()
                    .add(TEST_DRAFT_MINUTES, 'minutes')
                    .toISOString(),
            }),
            {
                success: i18n.t(
                    'Draft is live for {{minutes}} minutes. Reload the app in another tab to try it.',
                    {
                        interpolation: { escapeValue: false },
                        minutes: TEST_DRAFT_MINUTES,
                    }
                ),
                keepEditor: true,
            }
        )

    const handleAudit = () =>
        submit(buildDraftBody(stored, editable, { expiresAt: null }), {
            success: i18n.t(
                'Report-only audit started. Violations of the candidate policy show as Report-only.'
            ),
            keepEditor: true,
        })

    const handleStopDraft = () =>
        submit(buildStopDraftBody(stored), {
            success: i18n.t('Draft stopped. Your changes are still unsaved.'),
            keepEditor: true,
        })

    const handleReset = async () => {
        setBusy(true)
        try {
            await engine.mutate({
                resource: `${CSP_API}/apps/${appKey}`,
                type: 'delete',
            })
            setResetPrompt(false)
            setSubmitErrors([])
            successAlert.show({
                message: i18n.t('{{app}} uses the default policy again', {
                    interpolation: { escapeValue: false },
                    app: appName,
                }),
            })
            await refetchDetail()
        } catch (error) {
            errorAlert.show({
                message: i18n.t(
                    'Could not reset the CSP override: {{message}}',
                    {
                        interpolation: { escapeValue: false },
                        message: error.message,
                        nsSeparator: '-:-',
                    }
                ),
            })
        } finally {
            setBusy(false)
        }
    }

    const handleExemptToggle = ({ checked }) => {
        if (checked) {
            setExemptPrompt(entrypoint)
            return
        }
        const next = setEnforcementMode(editable, entrypoint, ENFORCE)
        update(next)
        submit(buildSaveBody(next), {
            success: i18n.t('CSP is enforced again for {{entrypoint}}', {
                interpolation: { escapeValue: false },
                entrypoint: entrypointLabel(entrypoint),
            }),
        })
    }

    const handleExemptConfirm = (note) => {
        const ep = exemptPrompt
        const next = {
            ...setEnforcementMode(editable, ep, REPORT_ONLY_EXEMPT),
            approvalNote: note,
        }
        update(next)
        submit(buildSaveBody(next, { confirmExempt: true }), {
            success: i18n.t('{{entrypoint}} is now exempt (report-only)', {
                interpolation: { escapeValue: false },
                entrypoint: entrypointLabel(ep),
            }),
            onDone: () => setExemptPrompt(null),
        })
    }

    // A fix is "allowed now" when its value is already in the saved effective
    // policy of its entrypoint (the server only marks external origins).
    const isFixAllowed = ({ entrypoint: ep, directive, value }) =>
        targetsFor(ep).every((target) => {
            const header =
                detail.effective?.[target]?.contentSecurityPolicy ||
                detail.effective?.[ENTRYPOINT_ALL]?.contentSecurityPolicy
            return (parseCspHeader(header)[directive] || []).includes(value)
        })

    const fixFor = (violation) => {
        const result = fixForViolation(violation, {
            overridable,
            locked: lockedDirectives,
            entrypoints: availableEntrypoints,
            httpsOnly,
        })
        if (!result.fix) {
            return { ...result, allowed: false }
        }
        const fix = {
            ...result.fix,
            targets: targetsFor(result.fix.entrypoint),
        }
        return { ...result, fix, allowed: isFixAllowed(fix) }
    }

    const isFixStaged = ({ entrypoint: ep, directive, value }) =>
        hasSource(editable, ENTRYPOINT_ALL, { directive, source: value }) ||
        targetsFor(ep).every((target) =>
            hasSource(editable, target, { directive, source: value })
        )

    const applyFixes = (fixes) => {
        const fresh = fixes.filter((fix) => !isFixStaged(fix))
        if (fresh.length === 0) {
            return
        }
        update(
            fresh.reduce(
                (doc, fix) =>
                    addSourceTo(doc, targetsFor(fix.entrypoint), {
                        directive: fix.directive,
                        source: fix.value,
                    }),
                editable
            )
        )
        setEntrypoint(fresh[0].entrypoint)
        const unsafe = fresh.some((fix) => fix.unsafe)
        successAlert.show({
            message: i18n.t('Staged {{fixes}}. {{next}}', {
                interpolation: { escapeValue: false },
                fixes: fresh
                    .map(
                        (fix) =>
                            `${fix.directive} ${fix.value} (${targetsFor(
                                fix.entrypoint
                            )
                                .map(entrypointLabel)
                                .join(' + ')})`
                    )
                    .join(', '),
                next: unsafe
                    ? i18n.t(
                          'Unsafe values need your confirmation on Apply & Save.'
                      )
                    : i18n.t('Test Draft or Apply & Save to use it.'),
            }),
        })
    }

    // Fixes passed in the URL (?fix=<entrypoint> <directive> <value>), e.g. from the
    // CSP violations overview. Re-checked here: locked directives and values the
    // server rejects are dropped.
    const location = useLocation()
    const history = useHistory()
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const requested = params.getAll('fix').map(decodeFix).filter(Boolean)
        if (requested.length === 0) {
            return
        }
        const fixes = requested
            .map(
                (fix) =>
                    checkFix(fix, {
                        overridable,
                        locked: lockedDirectives,
                        entrypoints: availableEntrypoints,
                        httpsOnly,
                    }).fix
            )
            .filter((fix) => fix && !isFixAllowed(fix))
        params.delete('fix')
        history.replace({ search: `?${params.toString()}` })
        applyFixes(fixes)
        // Runs once per mount; the URL is cleared right away.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const stage = (ep, { directive, source }) => {
        if (isFixStaged({ entrypoint: ep, directive, value: source })) {
            return
        }
        update(addSourceTo(editable, targetsFor(ep), { directive, source }))
    }

    const handleClearLog = async () => {
        try {
            await engine.mutate({
                resource: `${CSP_API}/apps/${appKey}/reports`,
                type: 'delete',
            })
            refetchReports.current()
        } catch (error) {
            errorAlert.show({
                message: i18n.t('Could not clear the log: {{message}}', {
                    interpolation: { escapeValue: false },
                    message: error.message,
                    nsSeparator: '-:-',
                }),
            })
        }
    }

    const generalErrors = serverErrors.filter(
        (error) =>
            !error.directive ||
            !editorDirectives.includes(error.directive) ||
            (error.entrypoint && error.entrypoint !== entrypoint)
    )
    const suggestions = detail.suggestions || []
    const allowedSuggestions = suggestions.filter((item) => item.alreadyAllowed)
    const visibleSuggestions = showAllowedSuggestions
        ? suggestions
        : suggestions.filter((item) => !item.alreadyAllowed)
    const summaryFlags = {
        ...(override
            ? {
                  hasExemptEntrypoint: override.hasExemptEntrypoint,
                  hasUnsafeDirectives: override.hasUnsafeDirectives,
                  unsafeTokens: override.unsafeTokens,
                  hasOverride: true,
              }
            : {}),
        baseUnsafeTokens: detail.baseUnsafeTokens,
    }
    const shippedTokens = (detail.baseUnsafeTokens || [])
        .map(parseToken)
        .filter(Boolean)

    return (
        <div className={styles.csp} data-test="csp-policy">
            <div className={styles.cspHeader}>
                <div>
                    <h2 className={styles.cspTitle}>
                        {i18n.t('Content Security Policy')}
                    </h2>
                    <p className={styles.muted}>
                        {override
                            ? i18n.t('Override saved by {{user}} {{time}}', {
                                  interpolation: { escapeValue: false },
                                  user: override.updatedBy || '?',
                                  time: override.updatedAt
                                      ? moment(override.updatedAt).fromNow()
                                      : '',
                              })
                            : i18n.t(
                                  'No override, {{app}} uses the default policy',
                                  {
                                      interpolation: { escapeValue: false },
                                      app: appName,
                                  }
                              )}
                    </p>
                    <CspBadges summary={summaryFlags} showOverride />
                </div>
                {override && (
                    <SwitchField
                        dense
                        label={i18n.t('Override active')}
                        helpText={i18n.t(
                            'Off keeps the override but uses the default policy'
                        )}
                        checked={editable.enabled}
                        onChange={({ checked }) =>
                            update({ ...editable, enabled: checked })
                        }
                        dataTest="csp-enabled"
                    />
                )}
            </div>

            {settings?.reportingEnabled === false && (
                <NoticeBox warning className={styles.notice}>
                    {i18n.t(
                        'CSP violation reporting is disabled on this server, so no new violations will show up.'
                    )}
                </NoticeBox>
            )}

            <DraftStatus
                stored={stored}
                effective={detail.effective}
                onStop={handleStopDraft}
                busy={busy}
            />

            <div className={styles.entrypointBar}>
                <span className={styles.entrypointLabel}>
                    {i18n.t('Entrypoint')}
                </span>
                <SegmentedControl
                    ariaLabel={i18n.t('Entrypoint')}
                    selected={entrypoint}
                    onChange={({ value }) => setEntrypoint(value)}
                    options={availableEntrypoints.map((ep) => ({
                        value: ep,
                        label:
                            entrypointLabel(ep) +
                            (diffs[ep] ? ' •' : '') +
                            (getEntrypoint(editable, ep).enforcementMode ===
                            REPORT_ONLY_EXEMPT
                                ? ` (${i18n.t('exempt')})`
                                : ''),
                    }))}
                />
            </div>
            {entrypoint !== ENTRYPOINT_ALL && (
                <p className={styles.muted}>
                    {i18n.t(
                        'Settings for one entrypoint add to the settings for all entrypoints (*).'
                    )}
                </p>
            )}
            {hasWorker && (
                <div className={styles.pairWorker}>
                    <Checkbox
                        dense
                        checked={pairWorker}
                        onChange={({ checked }) => setPairWorker(checked)}
                        label={i18n.t(
                            'Apply changes for App (index.html) and Service worker to both'
                        )}
                        dataTest="csp-pair-worker"
                    />
                    <p className={styles.muted} data-test="csp-worker-hint">
                        {i18n.t(
                            'This app has a service worker: requests it makes follow the Service worker policy, not the App one. With this on, an origin or token you add to or remove from one of them, or allow from a violation, is written to both entrypoints. Open tabs may need a hard reload to pick up a change.'
                        )}
                    </p>
                </div>
            )}

            {isExempt && (
                <NoticeBox
                    error
                    title={i18n.t(
                        '{{entrypoint}} is exempt from CSP enforcement',
                        {
                            interpolation: { escapeValue: false },
                            entrypoint: entrypointLabel(entrypoint),
                        }
                    )}
                    className={styles.notice}
                >
                    {i18n.t(
                        'Only frame-ancestors is enforced. The full policy runs report-only. Turn the exemption off in the danger zone below.'
                    )}
                </NoticeBox>
            )}

            <Section
                title={i18n.t('Recent violations')}
                description={i18n.t(
                    'Reported by browsers for {{app}} in the last 24 hours, all entrypoints.',
                    { interpolation: { escapeValue: false }, app: appName }
                )}
                dataTest="csp-section-violations"
            >
                <ViolationsTable
                    violations={violations}
                    loading={reports.loading && !reports.data}
                    error={reports.error}
                    fixFor={fixFor}
                    isStaged={isFixStaged}
                    onFix={(fix) => applyFixes([fix])}
                    onFixAll={applyFixes}
                    onClear={handleClearLog}
                />
            </Section>

            {suggestions.length > 0 && (
                <Section
                    title={i18n.t('Suggested origins')}
                    description={i18n.t(
                        'Origins the server found in this app configuration, for example external map layers. Adding stages them for {{entrypoint}}.',
                        {
                            interpolation: { escapeValue: false },
                            entrypoint: entrypointLabel(entrypoint),
                        }
                    )}
                    dataTest="csp-section-suggestions"
                >
                    {visibleSuggestions.length === 0 && (
                        <p className={styles.muted}>
                            {i18n.t(
                                'All {{count}} suggested origins are already allowed.',
                                { count: allowedSuggestions.length }
                            )}
                        </p>
                    )}
                    <ul className={styles.suggestionList}>
                        {visibleSuggestions.map((suggestion) => {
                            const staged =
                                hasSource(editable, entrypoint, suggestion) ||
                                (
                                    inherited[suggestion.directive] || []
                                ).includes(suggestion.source)
                            let status = null
                            if (suggestion.alreadyAllowed) {
                                status = i18n.t('Already allowed')
                            } else if (staged) {
                                status = i18n.t('Staged')
                            }
                            return (
                                <li
                                    key={`${suggestion.directive} ${suggestion.source}`}
                                    data-test="csp-suggestion"
                                >
                                    <div>
                                        <code>
                                            {suggestion.directive}{' '}
                                            {suggestion.source}
                                        </code>
                                        <div className={styles.muted}>
                                            {suggestion.detail ||
                                                suggestion.reason}
                                        </div>
                                    </div>
                                    {status ? (
                                        <span className={styles.muted}>
                                            {status}
                                        </span>
                                    ) : (
                                        <Button
                                            small
                                            onClick={() =>
                                                stage(entrypoint, suggestion)
                                            }
                                            dataTest="csp-suggestion-add"
                                        >
                                            {i18n.t('+ Add')}
                                        </Button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                    {allowedSuggestions.length > 0 && (
                        <Button
                            small
                            secondary
                            className={styles.parseButton}
                            onClick={() =>
                                setShowAllowedSuggestions((value) => !value)
                            }
                            dataTest="csp-suggestions-toggle"
                        >
                            {showAllowedSuggestions
                                ? i18n.t('Hide already allowed')
                                : i18n.t('Show {{count}} already allowed', {
                                      count: allowedSuggestions.length,
                                  })}
                        </Button>
                    )}
                </Section>
            )}

            <Section
                title={i18n.t('Allowed sources for {{entrypoint}}', {
                    interpolation: { escapeValue: false },
                    entrypoint: entrypointLabel(entrypoint),
                })}
                description={i18n.t(
                    'Bare origins only (https://host[:port]). Host wildcards like https://*.example.org only in img-src and connect-src. script-src accepts every value; unsafe ones (keywords, schemes, wildcards, http) need confirmation.',
                    {
                        interpolation: { escapeValue: false },
                        nsSeparator: '-:-',
                    }
                )}
                dataTest="csp-section-sources"
            >
                {editorDirectives.map((directive) => (
                    <DirectiveEditor
                        key={`${entrypoint}-${directive}`}
                        directive={directive}
                        values={current.enforced.add[directive] || []}
                        inherited={inherited[directive] || []}
                        errors={serverErrors.filter(
                            (error) =>
                                error.directive === directive &&
                                (!error.entrypoint ||
                                    error.entrypoint === entrypoint)
                        )}
                        httpsOnly={httpsOnly}
                        disabled={busy}
                        onAdd={(value) =>
                            update(
                                addSourceTo(editable, targetsFor(entrypoint), {
                                    directive,
                                    source: value,
                                })
                            )
                        }
                        onRemove={(value) =>
                            update(
                                removeSourceFrom(
                                    editable,
                                    targetsFor(entrypoint),
                                    { directive, source: value }
                                )
                            )
                        }
                        pairedWith={
                            targetsFor(entrypoint).length > 1
                                ? targetsFor(entrypoint)
                                      .filter((ep) => ep !== entrypoint)
                                      .map(entrypointLabel)
                                      .join(', ')
                                : null
                        }
                    />
                ))}
            </Section>

            {shippedTokens.length > 0 && (
                <Section
                    title={i18n.t('Unsafe sources shipped by core')}
                    description={i18n.t(
                        'DHIS2 core adds these for this app because it does not work without them. They are not admin overrides. Switch one off to remove it for that entrypoint, then Apply & Save.'
                    )}
                    dataTest="csp-section-shipped"
                >
                    <ul className={styles.shippedList}>
                        {shippedTokens.map((token) => {
                            const source = {
                                directive: token.directive,
                                source: token.value,
                            }
                            const removedForAll =
                                token.entrypoint !== ENTRYPOINT_ALL &&
                                isBaseSourceDisabled(
                                    editable,
                                    ENTRYPOINT_ALL,
                                    source
                                )
                            const on =
                                !removedForAll &&
                                !isBaseSourceDisabled(
                                    editable,
                                    token.entrypoint,
                                    source
                                )
                            return (
                                <li
                                    key={`${token.entrypoint} ${token.directive} ${token.value}`}
                                    data-test="csp-shipped-token"
                                >
                                    <SwitchField
                                        dense
                                        checked={on}
                                        disabled={busy || removedForAll}
                                        onChange={({ checked }) =>
                                            update(
                                                setBaseSourceEnabled(
                                                    editable,
                                                    token.entrypoint,
                                                    {
                                                        ...source,
                                                        enabled: checked,
                                                    }
                                                )
                                            )
                                        }
                                        label={`${entrypointLabel(
                                            token.entrypoint
                                        )}: ${token.directive} ${token.value}`}
                                        helpText={
                                            removedForAll
                                                ? i18n.t(
                                                      'Removed for all entrypoints'
                                                  )
                                                : `${i18n.t(
                                                      'Shipped by core'
                                                  )}. ${unsafeTokenRisk(
                                                      token.value
                                                  )}`
                                        }
                                        dataTest={`csp-shipped-switch-${token.entrypoint}`}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                </Section>
            )}

            <Section
                title={i18n.t('Base and default sources')}
                description={i18n.t(
                    'Baseline sources are always on. Uncheck a default source to remove it for {{entrypoint}}.',
                    {
                        interpolation: { escapeValue: false },
                        entrypoint: entrypointLabel(entrypoint),
                    }
                )}
                dataTest="csp-section-base"
            >
                <BaseSources
                    detail={detail}
                    editable={editable}
                    entrypoint={entrypoint}
                    lockedDirectives={lockedDirectives}
                    shippedUnsafe={detail.baseUnsafeTokens || []}
                    onToggle={(change) =>
                        update(
                            setBaseSourceEnabled(editable, entrypoint, change)
                        )
                    }
                />
            </Section>

            <Section
                title={i18n.t('Mandatory hardening')}
                description={i18n.t(
                    'Always enforced for every app; overrides cannot change these.'
                )}
                dataTest="csp-section-hardening"
            >
                <Hardening
                    detail={detail}
                    directives={HARDENING_DIRECTIVES}
                    effectiveHeader={effective?.contentSecurityPolicy}
                />
            </Section>

            <EffectiveHeader
                entrypoint={entrypoint}
                effective={effective}
                preview={preview}
                editableDirectives={editorDirectives}
                httpsOnly={httpsOnly}
                onStage={(candidates) =>
                    update(
                        candidates.reduce(
                            (doc, candidate) =>
                                addSourceTo(
                                    doc,
                                    targetsFor(entrypoint),
                                    candidate
                                ),
                            editable
                        )
                    )
                }
            />

            <section className={styles.dangerZone} data-test="csp-danger-zone">
                <h3 className={styles.dangerTitle}>
                    {i18n.t('Danger zone (last resort)')}
                </h3>
                <p>
                    {i18n.t(
                        'Some apps cannot work with any allowed source. Exempting an entrypoint turns enforcement off for it, and the browser only reports violations. Prefer allowed sources whenever possible.'
                    )}
                </p>
                <SwitchField
                    label={i18n.t('Report-only exemption for {{entrypoint}}', {
                        interpolation: { escapeValue: false },
                        entrypoint: entrypointLabel(entrypoint),
                    })}
                    checked={isExempt}
                    disabled={busy}
                    onChange={handleExemptToggle}
                    dataTest="csp-exempt-toggle"
                />
            </section>

            {generalErrors.length > 0 && (
                <NoticeBox
                    error
                    title={i18n.t('The server rejected this policy')}
                    className={styles.notice}
                    dataTest="csp-server-errors"
                >
                    <ul className={styles.riskList}>
                        {generalErrors.map((error) => (
                            <li
                                key={[
                                    error.entrypoint,
                                    error.directive,
                                    error.value,
                                    error.code,
                                    error.message,
                                ].join('|')}
                            >
                                {[
                                    error.entrypoint &&
                                        entrypointLabel(error.entrypoint),
                                    error.directive,
                                    error.value,
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                {error.entrypoint || error.directive
                                    ? ': '
                                    : ''}
                                {error.message}
                                {error.code ? ` (${error.code})` : ''}
                            </li>
                        ))}
                    </ul>
                </NoticeBox>
            )}

            <div className={styles.actionBar} data-test="csp-action-bar">
                <div className={styles.actionBarInfo}>
                    <InputField
                        dense
                        className={styles.noteInput}
                        label={i18n.t('Change note (optional)')}
                        value={editable.approvalNote}
                        onChange={({ value }) =>
                            update({ ...editable, approvalNote: value })
                        }
                        dataTest="csp-approval-note"
                    />
                    <span className={styles.muted} data-test="csp-dirty-state">
                        {dirty
                            ? i18n.t('Unsaved changes: {{eps}}', {
                                  interpolation: { escapeValue: false },
                                  eps:
                                      Object.keys(diffs)
                                          .map(entrypointLabel)
                                          .join(', ') || i18n.t('settings'),
                                  nsSeparator: '-:-',
                              })
                            : i18n.t('No unsaved changes')}
                    </span>
                    {draftable && notDraftable.length > 0 && (
                        <span className={styles.muted}>
                            {i18n.t(
                                'Test Draft and the audit cover added sources and removed defaults only; other changes apply on Apply & Save.'
                            )}
                        </span>
                    )}
                </div>
                <ButtonStrip>
                    <Button
                        onClick={handleTestDraft}
                        disabled={busy || !draftable || invalid}
                        dataTest="csp-test-draft"
                    >
                        {i18n.t('Test Draft ({{minutes}} min)', {
                            interpolation: { escapeValue: false },
                            minutes: TEST_DRAFT_MINUTES,
                        })}
                    </Button>
                    <Button
                        onClick={handleAudit}
                        disabled={busy || !draftable || invalid}
                        dataTest="csp-audit"
                    >
                        {i18n.t('Run Report-Only Audit')}
                    </Button>
                    <Button
                        primary
                        onClick={handleApply}
                        disabled={busy || !dirty || invalid}
                        loading={busy}
                        dataTest="csp-apply"
                    >
                        {i18n.t('Apply & Save')}
                    </Button>
                    {dirty && (
                        <Button
                            secondary
                            onClick={() => update(toEditable(override))}
                            disabled={busy}
                            dataTest="csp-discard"
                        >
                            {i18n.t('Discard changes')}
                        </Button>
                    )}
                    <Button
                        destructive
                        secondary
                        onClick={() => setResetPrompt(true)}
                        disabled={busy || (!override && !hasRunningDraft)}
                        dataTest="csp-reset"
                    >
                        {i18n.t('Reset to Default')}
                    </Button>
                </ButtonStrip>
            </div>

            {unsafePrompt && (
                <ConfirmUnsafeModal
                    tokens={unsafePrompt.tokens}
                    busy={busy}
                    onCancel={() => {
                        setUnsafePrompt(null)
                        setExemptPrompt(null)
                    }}
                    onConfirm={() =>
                        put(
                            { ...unsafePrompt.body, confirmUnsafe: true },
                            unsafePrompt.options
                        )
                    }
                />
            )}
            {exemptPrompt && !unsafePrompt && (
                <ConfirmExemptModal
                    appName={appName}
                    entrypoint={exemptPrompt}
                    initialNote={editable.approvalNote}
                    busy={busy}
                    onCancel={() => setExemptPrompt(null)}
                    onConfirm={handleExemptConfirm}
                />
            )}
            {resetPrompt && (
                <ConfirmResetModal
                    appName={appName}
                    busy={busy}
                    onCancel={() => setResetPrompt(false)}
                    onConfirm={handleReset}
                />
            )}
        </div>
    )
}

CspEditor.propTypes = {
    appKey: PropTypes.string.isRequired,
    appName: PropTypes.string.isRequired,
    detail: PropTypes.object.isRequired,
    refetchDetail: PropTypes.func.isRequired,
    settings: PropTypes.object,
}

export const CspPolicy = ({ appKey, appName }) => {
    const detailQuery = useMemo(
        () => ({
            detail: { resource: `${CSP_API}/apps/${appKey}` },
        }),
        [appKey]
    )
    const { data, error, refetch } = useDataQuery(detailQuery)
    const summary = useDataQuery(summaryQuery)

    if (error) {
        return (
            <NoticeBox
                error={error.type !== 'access'}
                warning={error.type === 'access'}
                title={
                    error.type === 'access'
                        ? i18n.t('No access to CSP settings')
                        : i18n.t('CSP settings are not available')
                }
                dataTest="csp-load-error"
            >
                {error.type === 'access'
                    ? i18n.t(
                          'Viewing needs the App Management app or the system settings authority; changing needs F_SYSTEM_SETTING.'
                      )
                    : error.message}
            </NoticeBox>
        )
    }
    // Data from a previously shown app can linger while the new one loads.
    if (!data || (data.detail.appKey && data.detail.appKey !== appKey)) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }
    const settings = summary.data?.summary
        ? {
              httpsOnly: summary.data.summary.httpsOnly,
              reportingEnabled: summary.data.summary.reportingEnabled,
          }
        : null

    return (
        <CspEditor
            key={appKey}
            appKey={appKey}
            appName={appName || data.detail.name || appKey}
            detail={data.detail}
            settings={settings}
            refetchDetail={refetch}
        />
    )
}

CspPolicy.propTypes = {
    appKey: PropTypes.string.isRequired,
    appName: PropTypes.string,
}
