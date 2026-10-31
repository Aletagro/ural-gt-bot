import React from 'react'

import Styles from './styles/ToggleRow.module.css'

// Строка с переключателем: подпись, пояснение и «тумблер». Для настроек, которые судья включает и выключает
const ToggleRow = ({label, hint, checked, onChange, disabled = false}) =>
    <button
        type='button'
        role='switch'
        aria-checked={checked}
        disabled={disabled}
        className={`${Styles.row} ${checked ? Styles.on : ''}`}
        onClick={onChange}
    >
        <span className={Styles.texts}>
            <span className={Styles.label}>{label}</span>
            {hint ? <span className={Styles.hint}>{hint}</span> : null}
        </span>
        <span className={Styles.track}><span className={Styles.thumb} /></span>
    </button>

export default ToggleRow
