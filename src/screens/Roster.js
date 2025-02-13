import React from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {player, rosters, rostersStuck} from '../utilities/appState'

import get from 'lodash/get'

import Styles from './styles/Roster.module.css'

const Roster = () => {
    const navigate = useNavigate()
    const {playerIndex} = useLocation().state
    let playerInfo = player
    if (playerIndex !== undefined) {
        playerInfo = get(rosters, `data[${playerIndex}]`)
    }
    const _roster = playerIndex ? JSON.parse(playerInfo.roster) : JSON.parse(player.roster)
    const rosterInfo = playerIndex !== undefined
        ? JSON.parse(playerInfo.roster_stat)
        : player

    const handleClickAllegiance = () => {
        navigate('/army', {state: {title: rosterInfo.allegiance, allegianceId: rosterInfo.allegianceId}})
    }

    const handleClickPrevRoster = () => {
        rostersStuck.count = rostersStuck.count + 1
        const index = playerIndex === 0 ? rosters.data.length - 1 :  playerIndex - 1
        navigate('/roster', {state: {title: `${playerInfo.surname} ${playerInfo.name}`, playerIndex: index}})
    }

    const handleClickNextRoster = () => {
        rostersStuck.count = rostersStuck.count + 1
        const index = playerIndex === rosters.data.length - 1 ? 0 : playerIndex + 1
        navigate('/roster', {state: {title: `${playerInfo.surname} ${playerInfo.name}`, playerIndex: index}})
    }

    return <div id='column' className='Chapter'>
        {playerIndex === undefined
            ? null
            : <div id={Styles.buttonContainer}>
                <button onClick={handleClickPrevRoster} id={Styles.nextButton}>Предыдущий</button>
                <button onClick={handleClickNextRoster} id={Styles.nextButton}>Следующий</button>
            </div>
        }
        <p id={Styles.text}>{_roster}</p>
        <button id={Styles.button} onClick={handleClickAllegiance}>Правила Армии</button>
    </div>
}

export default Roster