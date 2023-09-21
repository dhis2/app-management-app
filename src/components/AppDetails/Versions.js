import { useAlert, useConfig, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { PropTypes } from '@dhis2/prop-types'
import {
    Checkbox,
    Button,
    SingleSelect,
    SingleSelectOption,
    Table,
    TableHead,
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
} from '@dhis2/ui'
import moment from 'moment'
import React, { useReducer, useState } from 'react'
import semver from 'semver'
import { useApi } from '../../api.js'
import styles from './AppDetails.module.css'
import { channelToDisplayName } from './channel-to-display-name.js'

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

const ChannelsFilter = ({ versions, channelsFilter, setChannelsFilter }) => {
    const hasChannel = (channel) => versions.some((v) => v.channel === channel)
    const channels = Object.keys(channelToDisplayName).filter(hasChannel)

    if (channels.length <= 1) {
        return null
    }

    return (
        <div className={styles.versionsFilters}>
            <h3 className={styles.sectionSubheader}>
                {i18n.t('Channel', { context: 'AppHub release channel' })}
            </h3>
            {channels.map((name) => (
                <ChannelCheckbox
                    key={name}
                    name={name}
                    label={channelToDisplayName[name]}
                    channelsFilter={channelsFilter}
                    setChannelsFilter={setChannelsFilter}
                />
            ))}
        </div>
    )
}

ChannelsFilter.propTypes = {
    channelsFilter: PropTypes.object.isRequired,
    setChannelsFilter: PropTypes.func.isRequired,
    versions: PropTypes.array.isRequired,
}

const dataStoreQuery = {
    groupVersions: {
        resource: 'dataStore/app-management/capture',
        
    }
};

const VersionsTable = ({
    installedVersion,
    versions,
    onVersionInstall,
    userGroups,
}) => {
    const [userGroupVersionMap, setUserGroupVersionMap] = useReducer(
        (map, newMap) => ({ ...map, ...newMap }),
        {}
    )

    const { data: { groupVersions: dataStoreGroupVersions = {} } = {}, loading } = useDataQuery(dataStoreQuery);

    if (loading) {
        return null;
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
                    <TableCellHead>{i18n.t('Upload date')}</TableCellHead>
                    <TableCellHead></TableCellHead>
                    <TableCellHead></TableCellHead>
                </TableRowHead>
            </TableHead>
            <TableBody>
                {versions.map((version) => {
                    const versionActiveForUserGroup = Object
                    .entries(dataStoreGroupVersions)
                    ?.find(([, dataStoreVersion]) => dataStoreVersion === version.version)
                    ?.[0];

                    return (
                    <TableRow key={version.id}>
                        <TableCell>{version.version}</TableCell>
                        <TableCell>
                            {channelToDisplayName[version.channel]}
                        </TableCell>
                        <TableCell>
                            {moment(version.created).format('ll')}
                        </TableCell>
                        <TableCell>
                            <UserGroupSelector
                                userGroups={userGroups}
                                version={version.version}
                                onSelect={setUserGroupVersionMap}
                                versionActiveForUserGroup={versionActiveForUserGroup}
                            />
                        </TableCell>
                        <TableCell>
                            <Button
                                small
                                secondary
                                className={styles.installBtn}
                                disabled={version.version === installedVersion || versionActiveForUserGroup}
                                onClick={() =>
                                    onVersionInstall(
                                        version,
                                        Object.keys(userGroupVersionMap).find(
                                            (userGroupId) =>
                                                userGroupVersionMap[
                                                    userGroupId
                                                ] === version.version
                                        )
                                    )
                                }
                            >
                                {version.version === installedVersion || versionActiveForUserGroup
                                    ? i18n.t('Installed')
                                    : i18n.t('Install')}
                            </Button>
                            <a
                                download
                                href={version.downloadUrl}
                                className={styles.downloadLink}
                            >
                                <Button small secondary>
                                    {i18n.t('Download')}
                                </Button>
                            </a>
                        </TableCell>
                    </TableRow>
                )
                })}
            </TableBody>
        </Table>
    )
}

VersionsTable.propTypes = {
    userGroups: PropTypes.array.isRequired,
    versions: PropTypes.array.isRequired,
    onVersionInstall: PropTypes.func.isRequired,
    installedVersion: PropTypes.string,
}

export const Versions = ({
    installedVersion,
    versions,
    onVersionInstall,
    userGroups,
}) => {
    const [channelsFilter, setChannelsFilter] = useState(new Set(['stable']))
    const installSuccessAlert = useAlert(i18n.t('App installed successfully'), {
        success: true,
    })
    const installErrorAlert = useAlert(
        ({ error }) =>
            i18n.t('Failed to install app: {{errorMessage}}', {
                errorMessage: error.message,
                nsSeparator: '-:-',
            }),
        { critical: true }
    )
    const { serverVersion } = useConfig()
    const { installVersion } = useApi()
    const dhisVersion = semver.coerce(
        `${serverVersion.major}.${serverVersion.minor}`
    )
    const satisfiesDhisVersion = (version) => {
        const { minDhisVersion: min, maxDhisVersion: max } = version
        if (!min && !max) {
            return true
        } else if (min && max) {
            const range = new semver.Range(`${min} - ${max}`)
            return semver.satisfies(dhisVersion, range)
        } else if (!min && max) {
            const range = new semver.Range(`<=${max}`)
            return semver.satisfies(dhisVersion, range)
        } else if (min && !max) {
            const range = new semver.Range(`>=${min}`)
            return semver.satisfies(dhisVersion, range)
        }
    }
    const filteredVersions = versions
        .filter((version) => channelsFilter.has(version.channel))
        .filter(satisfiesDhisVersion)
    const handleVersionInstall = async (version, userGroupId) => {
        try {
            await installVersion(version.id, userGroupId)
            installSuccessAlert.show()
            onVersionInstall()
        } catch (error) {
            installErrorAlert.show({ error })
        }
    }

    return (
        <div className={styles.versionsContainer}>
            <ChannelsFilter
                versions={versions}
                channelsFilter={channelsFilter}
                setChannelsFilter={setChannelsFilter}
            />
            {filteredVersions.length > 0 ? (
                <VersionsTable
                    installedVersion={installedVersion}
                    versions={filteredVersions}
                    onVersionInstall={handleVersionInstall}
                    userGroups={userGroups}
                />
            ) : (
                <em>
                    {i18n.t(
                        'There are no compatible versions matching your criteria'
                    )}
                </em>
            )}
        </div>
    )
}

Versions.propTypes = {
    userGroups: PropTypes.array.isRequired,
    versions: PropTypes.array.isRequired,
    onVersionInstall: PropTypes.func.isRequired,
    installedVersion: PropTypes.string,
}

const UserGroupSelector = ({ userGroups, version, onSelect, versionActiveForUserGroup }) => {
    const [userGroup, setUserGroup] = useState('all')

    const onChange = ({ selected }) => {
        setUserGroup(selected)

        onSelect({ [selected]: version })
    }

    if (versionActiveForUserGroup) {
        const { displayName, id } = userGroups.find(group => group.id === versionActiveForUserGroup);

        return (
            <SingleSelect dense selected={versionActiveForUserGroup} disabled>
                  <SingleSelectOption
                    dense
                    label={displayName}
                    value={id}
                />
            </SingleSelect>
        );
    }

    return (
        <SingleSelect dense selected={userGroup} onChange={onChange}>
            <SingleSelectOption
                dense
                label={i18n.t('All user groups')}
                value="all"
            />
            {userGroups.map((group) => (
                <SingleSelectOption
                    dense
                    label={group.displayName}
                    value={group.id}
                    key={group.id}
                />
            ))}
        </SingleSelect>
    )
}

UserGroupSelector.propTypes = {
    userGroups: PropTypes.array.isRequired,
    version: PropTypes.string.isRequired,
    onSelect: PropTypes.func,
    versionActiveForUserGroup: PropTypes.string,
}
