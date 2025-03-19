import { useDataQuery } from '@dhis2/app-runtime'
import { useEffect, useState } from 'react'

const changelogQuery = {
    changelog: {
        resource: `appHub/v2/apps/`,
        id: ({ id }) => id + '/changelog',
    },
}

const useChangelog = ({ appId, hasChangelog }) => {
    const [changelog, setChangelog] = useState({})

    const { refetch: fetchChangelog } = useDataQuery(changelogQuery, {
        lazy: true,
        onComplete: (data) => {
            const changelog = new Changelog(data?.changelog?.changelog)

            const changelogByVersion = changelog?.data?.reduce?.(
                (acc, item) => {
                    acc[item.version] = item.rawChangeSummary

                    return acc
                },
                {}
            )

            setChangelog(changelogByVersion)
        },
    })

    useEffect(() => {
        if (appId && hasChangelog) {
            fetchChangelog({
                id: appId,
            })
        }
    }, [appId, fetchChangelog, hasChangelog])

    return changelog
}

class Changelog {
    data = []

    /**
     * The construction takes the changelog file content and parses it to `data` property
     * @constructor
     * @param {string} _changelog the changelog to parse
     */
    constructor(_changelog) {
        if (typeof _changelog === 'string') {
            this.#rawChangeLog = _changelog
            this.data = this.#parseChangelog()
        }
    }

    /**
     * property for the raw change log
     *
     * @private
     */
    #rawChangeLog

    /**
     * parses the changelog and assigns it to the public property data
     *
     * @private
     */
    #parseChangelog = () => {
        const lines = this.#rawChangeLog?.split('\n')

        const versions = []

        let lastVersion

        lines.forEach((line) => {
            // version header
            if (line.match(/^#{1,2}\s/)) {
                lastVersion = {
                    version: this.#getVersion(line),
                    changeSummary: [],
                    rawChangeSummary: '',
                }
                versions.push(lastVersion)
            } else {
                if (lastVersion) {
                    lastVersion.rawChangeSummary =
                        lastVersion.rawChangeSummary + '\n' + line
                }
            }
        })

        return versions
    }

    #getVersion = (line) => {
        const matches = /(?<version>\d+\.\d+\.\d+)/.exec(line)
        return matches?.groups?.version
    }
}

export default useChangelog
