import React from 'react'
import {useNavigate} from 'react-router-dom'
import {player} from '../utilities/appState'

import Styles from './styles/Registration.module.css'

const Roster = () => {
    const navigate = useNavigate()

    const handleClickAllegiance = () => {
        navigate('/army', {state: {title: player.allegiance, allegianceId: player.allegianceId}})
    }

    return <div id='column' className='Chapter'>
        <p id={Styles.roster}>{JSON.parse(player.roster)}</p>
        <button id={Styles.rosterButton} onClick={handleClickAllegiance}>Правила Армии</button>
    </div>
}

export default Roster