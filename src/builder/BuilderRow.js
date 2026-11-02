import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Chevron} from '../components/RosterParts'
import ImageCard from '../components/ImageCard'

import Styles from './styles/BuilderRow.module.css'

const BuilderRow = ({title, onClick, state, navigateTo, image, badge, size}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick(state)
        }
        navigate(`/${navigateTo}`, {state: {title, ...state}})
    }

    if (image !== undefined) {
        return <ImageCard title={title} image={image} badge={badge} size={size} onClick={onClick} state={state} navigateTo={navigateTo} />
    }

    return <div className='container'>
        <button type='button' className={Styles.row} onClick={handleClick}>
            <b className={Styles.title}>{title}</b>
            <Chevron />
        </button>
    </div>
}

export default BuilderRow
