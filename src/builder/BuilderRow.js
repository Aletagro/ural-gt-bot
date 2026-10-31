import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Chevron} from '../components/RosterParts'

import Styles from './styles/BuilderRow.module.css'

const BuilderRow = ({title, onClick, state, navigateTo}) => {
    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick(state)
        }
        navigate(`/${navigateTo}`, {state: {title, ...state}})
    }

    return <div className='container'>
        <button type='button' className={Styles.row} onClick={handleClick}>
            <b className={Styles.title}>{title}</b>
            <Chevron />
        </button>
    </div>
}

export default BuilderRow
