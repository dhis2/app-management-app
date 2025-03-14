import PropTypes from 'prop-types'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './Description.module.css'

export const Description = ({ description }) => {
    return (
        <div className={styles.description}>
            <ReactMarkdown>{description}</ReactMarkdown>
        </div>
    )
}

Description.propTypes = {
    description: PropTypes.string,
}
