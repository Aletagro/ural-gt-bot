import React from 'react'

import {meta} from '../utilities/appState'
import {useRoundTimer} from '../utilities/useRoundTimer'

import Styles from './styles/RoundTimer.module.css'

const STATUS_CLASS = {
    running: '',
    warning: Styles.warning,
    critical: Styles.critical,
    over: Styles.over,
}

// type 'hero': компактная плашка на шапке главного меню (пока таймера нет, показывает fallback)
// type 'panel': крупный блок для экрана игры и кабинета организатора (без таймера не показывается)
const RoundTimer = ({type = 'panel', fallback = null}) => {
    const timer = useRoundTimer()
    if (timer.status === 'off') return fallback

    const statusClass = STATUS_CLASS[timer.status]

    if (type === 'hero') {
        return <span className={`${Styles.pill} ${statusClass}`}>
            {meta.round ? `Раунд ${meta.round} · ` : ''}
            <span className={Styles.digits}>{timer.status === 'over' ? 'время вышло' : timer.text}</span>
        </span>
    }

    return <div className={`${Styles.panel} ${statusClass}`}>
        <span className={Styles.label}>{timer.status === 'over' ? 'Раунд' : 'До конца раунда'}</span>
        <span className={Styles.big}>{timer.status === 'over' ? 'Время вышло' : timer.text}</span>
        {timer.status === 'over' ? <span className={Styles.note}>Дойграйте текущий ход и сообщите результат</span> : null}
    </div>
}

export default RoundTimer
