import React from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {player, players, rostersStuck} from '../utilities/appState'

import get from 'lodash/get'
import find from 'lodash/find'

import Styles from './styles/Roster.module.css'

const Roster = () => {
    const navigate = useNavigate()
    const {playerId, playerIndex} = useLocation().state
    let playerInfo = player
    if (playerId !== undefined) {
        playerInfo = find(players.data, ['id', playerId])
    }
    const _roster = playerIndex ? JSON.parse(playerInfo.roster) : JSON.parse(player.roster)
    const rosterInfo = playerIndex !== undefined
        ? JSON.parse(playerInfo?.roster_stat)
        : player

    const handleClickAllegiance = () => {
        navigate('/army', {state: {title: rosterInfo.allegiance, allegianceId: rosterInfo.allegianceId}})
    }

    const goToOtherRoster = (index) => {
        rostersStuck.count = rostersStuck.count + 1
        const newPlayer = get(players, `rosters[${index}]`)
        navigate('/roster', {state: {title: `${newPlayer.surname} ${newPlayer.name}`, playerIndex: index}})
    }

    const handleClickPrevRoster = () => {
        const index = playerIndex === 0 ? players.rosters.length - 1 :  playerIndex - 1
        goToOtherRoster(index)
    }

    const handleClickNextRoster = () => {
        const index = playerIndex === players.rosters.length - 1 ? 0 : playerIndex + 1
        goToOtherRoster(index)
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
