import React from 'react'

import Styles from './styles/RosterViewSwitch.module.css'

// Переключатель вида ростера: карточки или текстовый Easy View
const RosterViewSwitch = ({easy, onChange}) => <div className={Styles.switch} role='tablist'>
    <button
        type='button'
        role='tab'
        aria-selected={!easy}
        className={`${Styles.option} ${!easy ? Styles.active : ''}`}
        onClick={() => onChange(false)}
    >
        Full
    </button>
    <button
        type='button'
        role='tab'
        aria-selected={easy}
        className={`${Styles.option} ${easy ? Styles.active : ''}`}
        onClick={() => onChange(true)}
    >
        Easy
    </button>
</div>

export default RosterViewSwitch
