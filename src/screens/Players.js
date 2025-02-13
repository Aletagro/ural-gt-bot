import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import map from 'lodash/map'

import Styles from './styles/Players.module.css'

const Players = () => {
    const navigate = useNavigate()
    const [players, setPlayers] = useState(null)

    useEffect(() => {
        fetch('https://aoscom.online/players/')
            .then(response => response.json())
            .then(data => {
                setPlayers(data)
            })
            .catch(error => console.error(error))
    }, [])

    const handleClickPlayer = (player) => () => {
        navigate('/playerInfo', {state: {player, title: `${player.surname} ${player.name}`}})
    }

    const renderRow = (place, player, army, w, d, to, co, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.smallColumn}>{place}</p>
        <p id={Styles.сolumn}>{player}</p>
        <p id={Styles.сolumn}>{army}</p>
        <p id={Styles.extraSmallColumn}>{w || 0}</p>
        <p id={Styles.extraSmallColumn}>{d || 0}</p>
        <p id={Styles.smallColumn}>{to || 0}</p>
        <p id={Styles.smallColumn}>{co || 0}</p>
    </div>

    const renderPlayer = (player, index) => {
        const allegiance = JSON.parse(player.roster_stat)?.allegiance
        return <button id={Styles.playerContainer} onClick={handleClickPlayer(player)}>
            {renderRow(index + 1, `${player.surname} ${player.name}`, allegiance, player.win, player.draw, player.to_sum, player.opp_pow, index % 2)}
        </button>
    }
    
    return <div id='column' className='Chapter'>
        <div>
            {renderRow('№', 'Игрок', 'Армия', 'W', 'D', 'TO', 'CO', true)}
            {map(players, renderPlayer)}
        </div>
    </div>
}

export default Players