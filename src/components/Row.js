import React from 'react';
import {useNavigate} from 'react-router-dom';
import RowImage from '../components/RowImage'
import {Chevron} from './RosterParts'

import Styles from './styles/Row.module.css'

// rightText: строка (обычный текст) или данные {points} / {cast, banish}, которые рисуются плашкой
export const renderRightText = (data) => {
    if (typeof data === 'string') {
        return <p id={Styles.rightText}>{data}</p>
    }
    if (data.points !== undefined) {
        return <div className={Styles.chip}>
            <span className={Styles.chipValue}>{data.points}</span>
            <span className={Styles.chipLabel}>pts</span>
        </div>
    }
    return <div className={Styles.chip}>
        <div className={Styles.chipPair}>
            <span className={Styles.chipCell}>
                <span className={Styles.chipValue}>{data.cast}</span>
                <span className={Styles.chipLabel}>Cast</span>
            </span>
            <span className={Styles.chipCell}>
                <span className={Styles.chipValue}>{data.banish}</span>
                <span className={Styles.chipLabel}>Banish</span>
            </span>
        </div>
    </div>
}

const Row = ({title, subtitle, rightText, image, navigateTo, state, onClick, accent}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        if (navigateTo) {
            navigate(`/${navigateTo}`, {state: {title, ...state}})
        }
        if (onClick) {
            onClick()
        }
    }

    return <button id={Styles.container} className={accent ? Styles.accent : undefined} onClick={handleClick}>
        {image ?<RowImage src={image} alt={title} /> : null}
        <div id={Styles.titleContainer}>
            <b id={Styles.title}>{title}</b>
            {subtitle ? <p id={Styles.subtitle}>{subtitle}</p> : null}
        </div>
        {rightText ? renderRightText(rightText) : null}
        <span className={Styles.arrow}><Chevron /></span>
    </button>
}

export default Row
