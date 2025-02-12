import React from 'react'
import {useNavigate} from 'react-router-dom'
import {navigationState} from '../utilities/appState'

import Styles from './styles/Lists.module.css'

const lists = [
    {
        id: 1,
        name: 'Тестовый листец',
        allegiance: 'Slaves to Darkness',
        allegianceId: 'f2b2d0ce-c458-4f7e-8c57-3f525d345df1'
    },
    {
        id: 2,
        name: 'Слейвы имба',
        allegiance: 'Slaves to Darkness',
        allegianceId: 'f2b2d0ce-c458-4f7e-8c57-3f525d345df1'
    }
]

const Lists = () => {
    const navigate = useNavigate()

    const handleClick = ({grandAlliance}) => {
        navigate('/chooseGrandAlliance')
    }

    const handleNavigateToRoster = (list) => () => {
        navigate('/builder', {state: {allegianceId: list.allegianceId, rosterId: list.id}})
        navigationState.isBuilder = true
    }

    const renderList = (list) => <button id={Styles.button} onClick={handleNavigateToRoster(list)} key={list.id}>
        <p>{list.name}</p>
        <p>{list.army}</p>
    </button>

    return  <div id='column' className='Chapter'>
        <button id={Styles.button} onClick={handleClick}>New Roster</button>
        {lists.map(renderList)}
    </div>
}

export default Lists