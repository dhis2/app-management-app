import React from 'react'
import styles from './Description.module.css'

export const Description = ({ description }) => {
    const lines = description.split('\n')
    return lines.map((line, index) => {
        if (!line.trim()) {
            return <br key={index} />
        }
        return (
            <p key={index} className={styles.paragraph}>
                {line}
            </p>
        )
    })
}
