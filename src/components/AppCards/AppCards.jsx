import PropTypes from 'prop-types'
import React from 'react'
import styles from './AppCards.module.css'

export const AppCards = ({ children }) => (
    <div className={styles.appCards}>{children}</div>
)

AppCards.propTypes = {
    children: PropTypes.array.isRequired,
}
