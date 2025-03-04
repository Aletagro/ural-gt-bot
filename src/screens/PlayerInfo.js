import React from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {players} from '../utilities/appState'

import map from 'lodash/map'
import get from 'lodash/get'
import find from 'lodash/find'

import Styles from './styles/PlayerInfo.module.css'

const PlayerInfo = () => {
    const navigate = useNavigate()
    const {player} = useLocation().state
    const rosterInfo = JSON.parse(player.roster_stat)
    
    const handleClickAllegiance = () => {
        navigate('/army', {state: {title: rosterInfo.allegiance, allegianceId: rosterInfo.allegianceId}})
    }

    const handleClickPlayer = (player) => () => {
        navigate('/playerInfo', {state: {player, title: `${player.surname} ${player.name}`}})
    }

    const renderPlayRow = (number, player, result, to, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.extraSmallColumn}>{number}</p>
        <p id={Styles.сolumn}>{player}</p>
        <p id={Styles.smallColumn}>{result}</p>
        <p id={Styles.smallColumn}>{to || 0}</p>
    </div>

    const renderPlay = (playIndex, index) => {
        const oppId = get(player, `game_${playIndex}_opp`)
        const opponent = find(players.data, ['id', oppId])
        const tp = get(player, `game_${playIndex}_tp`)
        const gameResult = tp > 10 ? 'Win' : tp === 10 ? 'Draw' : tp === null ? '' : 'Lose'
        return opponent
            ? <button key={index} id={Styles.playContainer} onClick={handleClickPlayer(opponent)}>
                {renderPlayRow(playIndex, `${opponent.surname} ${opponent.name}`, gameResult, tp, index % 2)}
            </button>
            : null
    }
    
    return <div id='column' className='Chapter'>
        <p id={Styles.title}><b>Город:</b> {player.city}</p>
        <p id={Styles.title}><b>Гранд Альянс:</b> {rosterInfo?.grandAlliance}</p>
        <p id={Styles.title}><b>Армия:</b> {rosterInfo?.allegiance}</p>
        {player.game_1_opp
            ? <>
                <b id={Styles.title}>Игры</b>
                    <div id={Styles.tableContainer}>
                    {renderPlayRow('№', 'Оппонент', 'Результат', 'ТО', true)}
                    {map([1, 2, 3, 4, 5], renderPlay)}
                </div>
            </>
            : null
        }
        <b id={Styles.title}>Ростер</b>
        <p id={Styles.roster}>{JSON.parse(player.roster)}</p>
        <button id={Styles.rulesButton} onClick={handleClickAllegiance}>Правила Армии</button>
    </div>
}

export default PlayerInfo