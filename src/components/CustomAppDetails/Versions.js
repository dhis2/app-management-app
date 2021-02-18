import { useAlert, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import {
    Checkbox,
    SingleSelectField,
    SingleSelectOption,
    Button,
    Table,
    TableHead,
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
} from '@dhis2/ui'
import moment from 'moment'
import React, { useState } from 'react'
import semver from 'semver'
import styles from './CustomAppDetails.module.css'

const channelToDisplayName = {
    Stable: i18n.t('Stable', {
        context: 'Name of AppHub release channel',
    }),
    Development: i18n.t('Development', {
        context: 'Name of AppHub release channel',
    }),
    Canary: i18n.t('Canary', {
        context: 'Name of AppHub release channel',
    }),
}

const installVersion = (baseUrl, versionId) =>
    fetch(`${baseUrl}/api/appHub/${versionId}`, {
        method: 'post',
        credentials: 'include',
    }).then(res => {
        if (status >= 300) {
            throw new Error(res.statusText)
        }
    })

const ChannelCheckbox = ({
    name,
    label,
    channelsFilter,
    setChannelsFilter,
}) => {
    const handleChange = ({ checked }) => {
        const newState = new Set(channelsFilter)
        if (checked) {
            newState.add(name)
        } else {
            newState.delete(name)
        }
        setChannelsFilter(newState)
    }

    return (
        <div className={styles.channelCheckbox}>
            <Checkbox
                checked={channelsFilter.has(name)}
                disabled={channelsFilter.size === 1 && channelsFilter.has(name)}
                onChange={handleChange}
                label={label}
            />
        </div>
    )
}

ChannelCheckbox.propTypes = {
    channelsFilter: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    setChannelsFilter: PropTypes.func.isRequired,
}

const Filters = ({
    versions,
    channelsFilter,
    setChannelsFilter,
    dhisVersionFilter,
    setDhisVersionFilter,
    dhisVersions,
}) => {
    const hasChannel = channel => versions.some(v => v.channel === channel)

    return (
        <div className={styles.versionsFilters}>
            <h3 className={styles.sectionSubheader}>
                {i18n.t('Channel', { context: 'AppHub release channel' })}
            </h3>
            {Object.keys(channelToDisplayName)
                .filter(hasChannel)
                .map(name => (
                    <ChannelCheckbox
                        key={name}
                        name={name}
                        label={channelToDisplayName[name]}
                        channelsFilter={channelsFilter}
                        setChannelsFilter={setChannelsFilter}
                    />
                ))}

            <div className={styles.dhisVersionSelect}>
                <SingleSelectField
                    placeholder={i18n.t('Select a version')}
                    label={i18n.t('Compatible with DHIS2 version')}
                    clearable
                    selected={dhisVersionFilter}
                    onChange={({ selected }) => setDhisVersionFilter(selected)}
                >
                    {dhisVersions.map(dhisVersion => (
                        <SingleSelectOption
                            key={dhisVersion}
                            label={dhisVersion}
                            value={dhisVersion}
                        />
                    ))}
                </SingleSelectField>
            </div>
        </div>
    )
}

Filters.propTypes = {
    channelsFilter: PropTypes.object.isRequired,
    dhisVersionFilter: PropTypes.string.isRequired,
    dhisVersions: PropTypes.array.isRequired,
    setChannelsFilter: PropTypes.func.isRequired,
    setDhisVersionFilter: PropTypes.func.isRequired,
    versions: PropTypes.array.isRequired,
}

const VersionsTable = ({ installedVersion, versions, onVersionInstall }) => {
    const renderVersionRange = (min, max) => {
        if (min && max) {
            return `${min}–${max}`
        } else if (min && !max) {
            return i18n.t('{{minDhisVersion}} and above', {
                minDhisVersion: min,
            })
        } else if (!min && max) {
            return i18n.t('{{maxDhisVersion}} and below', {
                maxDhisVersion: max,
            })
        } else {
            return i18n.t('All versions')
        }
    }

    return (
        <Table>
            <TableHead>
                <TableRowHead>
                    <TableCellHead>{i18n.t('Version')}</TableCellHead>
                    <TableCellHead>
                        {i18n.t('Channel', {
                            context: 'AppHub release channel',
                        })}
                    </TableCellHead>
                    <TableCellHead>
                        {i18n.t('DHIS2 version compatibility')}
                    </TableCellHead>
                    <TableCellHead>{i18n.t('Upload date')}</TableCellHead>
                    <TableCellHead></TableCellHead>
                </TableRowHead>
            </TableHead>
            <TableBody>
                {versions.map(version => (
                    <TableRow key={version.id}>
                        <TableCell>{version.version}</TableCell>
                        <TableCell>{version.channel}</TableCell>
                        <TableCell>
                            {renderVersionRange(
                                version.minDhisVersion,
                                version.maxDhisVersion
                            )}
                        </TableCell>
                        <TableCell>
                            {moment(version.created).format('L')}
                        </TableCell>
                        <TableCell>
                            <Button
                                small
                                secondary
                                className={styles.installBtn}
                                disabled={version.version === installedVersion}
                                onClick={() => onVersionInstall(version)}
                            >
                                {version.version === installedVersion
                                    ? i18n.t('Installed')
                                    : i18n.t('Install')}
                            </Button>
                            <a download href={version.downloadUrl}>
                                <Button small secondary>
                                    {i18n.t('Download')}
                                </Button>
                            </a>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

VersionsTable.propTypes = {
    versions: PropTypes.array.isRequired,
    onVersionInstall: PropTypes.func.isRequired,
    installedVersion: PropTypes.string,
}

const Versions = ({ installedVersion, versions, reloadPage }) => {
    const [channelsFilter, setChannelsFilter] = useState(new Set(['Stable']))
    const [dhisVersionFilter, setDhisVersionFilter] = useState('')
    const installSuccessAlert = useAlert(i18n.t('App installed successfully'), {
        success: true,
    })
    const installErrorAlert = useAlert(
        ({ error }) =>
            i18n.t('Failed to install app: {{errorMessage}}', {
                errorMessage: error.message,
                nsSeparator: null,
            }),
        { critical: true }
    )
    const { baseUrl, apiVersion } = useConfig()
    const latestDhisVersion = `2.${apiVersion}`
    const dhisVersions = [
        latestDhisVersion,
        `2.${apiVersion - 1}`,
        `2.${apiVersion - 2}`,
    ]
    const dhisVersionFilterSemver = semver.coerce(dhisVersionFilter)
    const satisfiesDhisVersion = version => {
        const { minDhisVersion: min, maxDhisVersion: max } = version
        if (!dhisVersionFilter || (!min && !max)) {
            return true
        } else if (min && max) {
            const range = new semver.Range(`${min} - ${max}`)
            return semver.satisfies(dhisVersionFilterSemver, range)
        } else if (!min && max) {
            const range = new semver.Range(`<=${max}`)
            return semver.satisfies(dhisVersionFilterSemver, range)
        } else if (min && !max) {
            const range = new semver.Range(`>=${min}`)
            return semver.satisfies(dhisVersionFilterSemver, range)
        }
    }
    const filteredVersions = versions
        .filter(version => channelsFilter.has(version.channel))
        .filter(satisfiesDhisVersion)
    const handleVersionInstall = async version => {
        try {
            await installVersion(baseUrl, version.id)
            installSuccessAlert.show()
            reloadPage()
        } catch (error) {
            installErrorAlert.show({ error })
        }
    }

    return (
        <div className={styles.versionsContainer}>
            <Filters
                versions={versions}
                dhisVersions={dhisVersions}
                channelsFilter={channelsFilter}
                setChannelsFilter={setChannelsFilter}
                dhisVersionFilter={dhisVersionFilter}
                setDhisVersionFilter={setDhisVersionFilter}
            />
            <VersionsTable
                installedVersion={installedVersion}
                versions={filteredVersions}
                onVersionInstall={handleVersionInstall}
            />
        </div>
    )
}

Versions.propTypes = {
    reloadPage: PropTypes.func.isRequired,
    versions: PropTypes.array.isRequired,
    installedVersion: PropTypes.string,
}

export default Versions
