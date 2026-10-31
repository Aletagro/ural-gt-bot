import React from 'react'

import Styles from './styles/InfoNote.module.css'

// Информационная плашка: кремовая карточка с золотой полосой слева. Для пояснений и сроков на экранах игрока
// accent: выделенный вариант (тёмная плашка) для важного, например дедлайна
const InfoNote = ({children, title, accent = false}) =>
    <div className={`${Styles.note} ${accent ? Styles.accent : ''}`}>
        {title ? <p className={Styles.title}>{title}</p> : null}
        <div className={Styles.text}>{children}</div>
    </div>

export default InfoNote
