import React, {useReducer} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import Roster from '../components/Roster'
import RosterEasy from '../components/RosterEasy'
import Checkbox from '../components/Checkbox'
import {player, players, rostersStuck, rosterViewType} from '../utilities/appState'

import get from 'lodash/get'
import find from 'lodash/find'

import Styles from './styles/RosterScreen.module.css'

const RosterScreen = () => {
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const {playerId, playerIndex, isInfo} = useLocation().state
    let playerInfo = player
    if (playerId !== undefined) {
        playerInfo = find(players.data, ['id', playerId])
    }

    const _roster = playerIndex !== undefined || isInfo
        ? playerInfo.roster ? JSON.parse(playerInfo.roster) : ''
        : player.roster ? JSON.parse(player.roster) : ''
    const rosterInfo = playerIndex !== undefined || isInfo
        ? playerInfo?.roster_stat ? JSON.parse(playerInfo?.roster_stat) : {}
        : player

    const handleClickAllegiance = () => {
        navigate('/army', {state: {title: rosterInfo.allegiance, allegianceId: rosterInfo.allegianceId}})
    }

    const goToOtherRoster = (index) => {
        rostersStuck.count = rostersStuck.count + 1
        const newPlayer = get(players, `rosters[${index}]`)
        navigate('/roster', {state: {title: `${newPlayer.surname} ${newPlayer.name}`, playerId: newPlayer.id, playerIndex: index}})
    }

    const handleClickPrevRoster = () => {
        const index = playerIndex === 0 ? players.rosters.length - 1 :  playerIndex - 1
        goToOtherRoster(index)
    }

    const handleClickNextRoster = () => {
        const index = playerIndex === players.rosters.length - 1 ? 0 : playerIndex + 1
        goToOtherRoster(index)
    }

    const handleChangeViewType = () => {
        rosterViewType.easy = !rosterViewType.easy
        forceUpdate()
    }

    return <div id='column' className='Chapter'>
        {playerIndex === undefined
            ? null
            : <div id={Styles.buttonContainer}>
                <button onClick={handleClickPrevRoster} id={Styles.nextButton}>Предыдущий</button>
                <button onClick={handleClickNextRoster} id={Styles.nextButton}>Следующий</button>
            </div>
        }
        <div id={Styles.checkboxContainer} onClick={handleChangeViewType}>
            <p id={Styles.checkboxText}>Easy View</p>
            <Checkbox onClick={handleChangeViewType} checked={rosterViewType.easy} />
        </div>
        {rosterViewType.easy
            ? <RosterEasy roster={_roster} info={rosterInfo} />
            : <Roster roster={_roster} info={rosterInfo} />
        }
        <button id={Styles.button} onClick={handleClickAllegiance}>Правила Армии</button>
    </div>
}

export default RosterScreen
