import React from 'react'
import {useNavigate} from 'react-router-dom'

import Styles from './styles/ListCard.module.css'

// Заголовок раздела: название и золотая линия
export const SectionTitle = ({children}) => <h4 className={Styles.sectionTitle}>{children}</h4>

// Один пункт списка внутри карточки
export const ListItem = ({title, navigateTo, state, onClick}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick()
        }
        if (navigateTo) {
            navigate(`/${navigateTo}`, {state: {title, ...state}})
        }
    }

    return <button type='button' className={Styles.item} onClick={handleClick}>
        <span className={Styles.title}>{title}</span>
        <span className={Styles.chevron} aria-hidden='true' />
    </button>
}

// Карточка, в которой пункты разделены тонкими линиями
export const ListCard = ({children}) => <div className={Styles.card}>{children}</div>
