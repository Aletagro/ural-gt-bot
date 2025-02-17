import React, {useEffect, useReducer} from 'react'
// import {useNavigate} from 'react-router-dom'
import {players} from '../utilities/appState'

import map from 'lodash/map'

import Styles from './styles/Players.module.css'

const Players = () => {
    // const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    useEffect(() => {
        fetch('https://aoscom.online/players/')
            .then(response => response.json())
            .then(data => {
                players.data = data
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

    const handleClickPlayer = (player) => () => {
        // navigate('/playerInfo', {state: {player, title: `${player.surname} ${player.name}`}})
    }

    const renderRow = (place, player, city, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.smallColumn}>{place}</p>
        <p id={Styles.сolumn}>{player}</p>
        <p id={Styles.сolumn}>{city}</p>
    </div>

    // const renderRow = (place, player, army, w, d, to, co, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
    //     <p id={Styles.smallColumn}>{place}</p>
    //     <p id={Styles.сolumn}>{player}</p>
    //     <p id={Styles.сolumn}>{army}</p>
    //     <p id={Styles.extraSmallColumn}>{w || 0}</p>
    //     <p id={Styles.extraSmallColumn}>{d || 0}</p>
    //     <p id={Styles.smallColumn}>{to || 0}</p>
    //     <p id={Styles.smallColumn}>{co || 0}</p>
    // </div>

    const renderPlayer = (player, index) => {
        // const allegiance = JSON.parse(player.roster_stat)?.allegiance
        return <button key={index} id={Styles.playerContainer} onClick={handleClickPlayer(player)}>
            {renderRow(index + 1, `${player.surname} ${player.name}`, player.city, index % 2)}
            {/* {renderRow(index + 1, `${player.surname} ${player.name}`, allegiance, player.win, player.draw, player.to_sum, player.opp_pow, index % 2)} */}
        </button>
    }
    
    return <div id='column' className='Chapter'>
        <div>
            {renderRow('№', 'Игрок', 'Город', true)}
            {/* {renderRow('№', 'Игрок', 'Армия', 'W', 'D', 'TO', 'CO', true)} */}
            {map(players.data, renderPlayer)}
        </div>
    </div>
}

export default Players
