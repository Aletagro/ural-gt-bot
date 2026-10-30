import React from 'react'

import Styles from './styles/Button.module.css'

// Общая кнопка приложения. Внешний вид задаётся вариантом, а расположение (отступы, ширина, flex) — через className экрана
// type: 'primary' (главное действие), 'secondary' (второстепенное), 'soft' (спокойная, для длинных списков кнопок), 'danger' (необратимое действие)
// size: 'md' (по умолчанию) или 'sm' (компактная)
const Button = ({children, onClick, type = 'primary', size = 'md', disabled = false, className}) =>
    <button
        type='button'
        disabled={disabled}
        onClick={onClick}
        className={[Styles.button, Styles[type], size === 'sm' && Styles.small, className].filter(Boolean).join(' ')}
    >
        {children}
    </button>

export default Button
