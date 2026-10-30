import React from 'react'

import Styles from './styles/ModalActions.module.css'

// Кнопки внутри модального окна. Короткие подписи встают рядом, длинные переносятся на отдельные строки
export const ModalActions = ({children}) => <div className={Styles.actions}>{children}</div>

// variant: 'primary' (основное действие), 'secondary' (отмена), 'danger' (необратимое действие)
export const ModalButton = ({children, onClick, variant = 'secondary'}) =>
    <button className={`${Styles.button} ${Styles[variant]}`} onClick={onClick}>{children}</button>
