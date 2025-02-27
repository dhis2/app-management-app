import PropTypes from 'prop-types'
import React from 'react'

function ReactMarkdown({ children }) {
    return <>{children}</>
}

ReactMarkdown.propTypes = {
    children: PropTypes.node,
}

export default ReactMarkdown
