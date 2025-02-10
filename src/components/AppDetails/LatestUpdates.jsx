import PropTypes from 'prop-types'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useHistory } from 'react-router-dom'
import styles from './LatestUpdates.module.css'

export const LatestUpdates = ({ changelog, installedVersion, versions }) => {
    const history = useHistory()
    if (!changelog) {
        return null
    }
    const upToVersionIndex = versions.findIndex(
        (v) => v.version === installedVersion
    )

    // showing at least the last 5 versions, but potentially more if the installed version is older
    const versionsToShow = upToVersionIndex > 5 ? upToVersionIndex : 5

    return (
        <div className={styles.latestUpdatesWrapper}>
            <div className={styles.latestUpdates}>
                <h2 className={styles.latestUpdatesHeader}>Latest updates:</h2>

                <ol className={styles.versionList}>
                    {versions.slice(0, versionsToShow).map((version) => {
                        return (
                            <li key={version.version}>
                                <h3
                                    className={
                                        styles.latestUpdatesVersionHeading
                                    }
                                >
                                    {version.version}
                                </h3>
                                <div className={styles.changeSummary}>
                                    <ReactMarkdown>
                                        {changelog[version.version]}
                                    </ReactMarkdown>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </div>
            <div className={styles.showAllLink}>
                <span
                    role="link"
                    onClick={() => history.push('?tab=previous-releases')}
                >
                    Show all updates
                </span>
            </div>
        </div>
    )
}

LatestUpdates.propTypes = {
    changelog: PropTypes.object,
    installedVersion: PropTypes.string,
    versions: PropTypes.array,
}
