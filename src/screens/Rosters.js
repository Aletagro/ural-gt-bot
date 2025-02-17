import React, {useEffect, useReducer} from 'react'
import {useNavigate} from 'react-router-dom'
import {players} from '../utilities/appState'

import map from 'lodash/map'

import Styles from './styles/Players.module.css'

const Rosters = () => {
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    useEffect(() => {
        fetch('https://aoscom.online/rosters/')
            .then(response => response.json())
            .then(data => {
                players.rosters = data
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

    const handleClickPlayer = (player, index) => () => {
        navigate('/roster', {state: {title: `${player.surname} ${player.name}`, playerId: player.id, playerIndex: index}})
    }

    const renderRow = (number, player, army, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.smallColumn}>{number}</p>
        <p id={Styles.сolumn}>{player}</p>
        <p id={Styles.сolumn}>{army}</p>
    </div>

    const renderRoster = (player, index) => {
        const allegiance = JSON.parse(player.roster_stat)?.allegiance
        return <button key={player.id} id={Styles.playerContainer} onClick={handleClickPlayer(player, index)}>
            {renderRow(index + 1, `${player.surname} ${player.name}`, allegiance, index % 2)}
        </button>
    }
    
    return <div id='column' className='Chapter'>
        <div>
            {renderRow('№', 'Игрок', 'Армия', true)}
            {map(players.rosters, renderRoster)}
        </div>
    </div>
}

export default Rosters
