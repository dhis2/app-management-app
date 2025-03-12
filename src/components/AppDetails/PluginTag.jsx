import { Tag } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'

const PluginTag = ({ hasPlugin, pluginType }) => {
    if (!hasPlugin) {
        return null
    }
    const tagString = pluginType ? `Plugin: ${pluginType}` : 'Plugin'

    return <Tag>{tagString}</Tag>
}

PluginTag.propTypes = {
    hasPlugin: PropTypes.bool,
    pluginType: PropTypes.string,
}
export default PluginTag
