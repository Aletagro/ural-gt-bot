import React from 'react';
import {useNavigate} from 'react-router-dom';
import RowImage from '../components/RowImage'
import {Chevron} from './RosterParts'

import Styles from './styles/Row.module.css'

const renderRightText = (text) => {
    const points = /^(\d+)\s*pts$/.exec(text)
    if (points) {
        return <div className={Styles.chip}>
            <span className={Styles.chipValue}>{points[1]}</span>
            <span className={Styles.chipLabel}>pts</span>
        </div>
    }
    const manifestation = /^([^/\s]+)\/([^/\s]+)$/.exec(text)
    if (manifestation) {
        return <div className={Styles.chip}>
            <div className={Styles.chipPair}>
                <span className={Styles.chipCell}>
                    <span className={Styles.chipValue}>{manifestation[1]}</span>
                    <span className={Styles.chipLabel}>Cast</span>
                </span>
                <span className={Styles.chipCell}>
                    <span className={Styles.chipValue}>{manifestation[2]}</span>
                    <span className={Styles.chipLabel}>Banish</span>
                </span>
            </div>
        </div>
    }
    return <p id={Styles.rightText}>{text}</p>
}

const Row = ({title, subtitle, rightText, image, navigateTo, state, onClick, accent}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/${navigateTo}`, {state: {title, ...state}})
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
