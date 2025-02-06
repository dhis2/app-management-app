import { useAlerts } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'

const MockAlert = ({ alert }) => {
    useEffect(() => {
        if (alert.options?.duration) {
            setTimeout(() => alert.remove(), alert.options?.duration)
        }
    }, [alert])
    return (
        <div style={{ backgroundColor: '#CCC', padding: 8 }}>
            {alert.message}
            {alert?.options?.actions?.map((action, i) => (
                <button key={i} onClick={action.onClick}>
                    {action.label}
                </button>
            ))}
        </div>
    )
}

MockAlert.propTypes = {
    alert: PropTypes.shape({
        message: PropTypes.string,
        options: PropTypes.shape({
            actions: PropTypes.arrayOf(
                PropTypes.shape({
                    label: PropTypes.string,
                    onClick: PropTypes.func,
                })
            ),
            duration: PropTypes.number,
        }),
        remove: PropTypes.func,
    }),
}

export const MockAlertStack = () => {
    const alerts = useAlerts()

    return (
        <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
            {alerts.map((alert) => (
                <MockAlert key={alert.id} alert={alert} />
            ))}
        </div>
    )
}
