import React from 'react'

import Button from './Button'
import Styles from './styles/ModalActions.module.css'

// Кнопки внутри модального окна. Короткие подписи встают рядом, длинные переносятся на отдельные строки
export const ModalActions = ({children}) => <div className={Styles.actions}>{children}</div>

// type: 'primary' (основное действие), 'secondary' (отмена), 'danger' (необратимое действие)
export const ModalButton = ({children, onClick, type = 'secondary'}) =>
    <Button type={type} onClick={onClick} className={Styles.button}>{children}</Button>
