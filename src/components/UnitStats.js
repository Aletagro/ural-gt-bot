import React from 'react'
import map from 'lodash/map'
import every from 'lodash/every'

import Styles from './styles/UnitStats.module.css'

// Базовые характеристики юнита: Move / Health / Control / Save
const UnitStats = ({unit}) => {
    const stats = [
        {label: 'Move', value: unit?.move},
        {label: 'Health', value: unit?.health},
        {label: 'Control', value: unit?.control},
        {label: 'Save', value: unit?.save}
    ]
    if (!every(stats, 'value')) {
        return null
    }
    return <div className={Styles.stats}>
        {map(stats, ({label, value}) => <span key={label} className={Styles.stat}>
            <span className={Styles.value}>{value}</span>
            <span className={Styles.label}>{label}</span>
        </span>)}
    </div>
}

export default UnitStats
