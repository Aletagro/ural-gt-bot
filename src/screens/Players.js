import React, {useState, useEffect, useReducer} from 'react'
import {useNavigate} from 'react-router-dom'
import useDebounce from '../utilities/useDebounce'
import {players, search} from '../utilities/appState'

import map from 'lodash/map'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Players.module.css'

const Players = () => {
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState(search.playersValue)
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    const sortPlayers = (array) => array.sort((a, b) => {
        // Сначала сравниваем по полю win
        if (a.win !== b.win) {
            return b.win - a.win // Сортируем по убыванию
        }
        // Если win равны, сравниваем по полю draw
        if (a.draw !== b.draw) {
            return b.draw - a.draw // Сортируем по убыванию
        }
        // Если draw равны, сравниваем по полю tp_sum
        if (a.tp_sum !== b.tp_sum) {
            return b.tp_sum - a.tp_sum // Сортируем по убыванию
        }
        // Если tp_sum равны, сравниваем по полю opp_p
        return b.opp_p - a.opp_p // Сортируем по убыванию
    })

    useDebounce(() => {
        if (searchValue) {
            const _rosters = filter(players.data, (player) => {
                const rosterInfo = JSON.parse(player.roster_stat)
                return includes(lowerCase(`${player.surname} ${player.name}`), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo?.allegiance), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo.grandAlliance), lowerCase(searchValue)) ||
                    includes(lowerCase(player.city), lowerCase(searchValue))
            })
            search.players = sortPlayers(_rosters)
        } else {
            search.players = sortPlayers(players.data)
        }
        forceUpdate()
      }, [searchValue], 300
    )

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
        navigate('/playerInfo', {state: {player, title: `${player.surname} ${player.name}`}})
    }

    const handleSearch = (e) => {
        search.playersValue = e.target.value
        setSearchValue(e.target.value)
    }

    const renderRow = (place, player, army, w, d, tp, co, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.smallColumn}>{place}</p>
        <p id={Styles.сolumn}>{player}</p>
        <p id={Styles.сolumn}>{army}</p>
        <p id={Styles.extraSmallColumn}>{w || 0}</p>
        <p id={Styles.extraSmallColumn}>{d || 0}</p>
        <p id={Styles.smallColumn}>{tp || 0}</p>
        <p id={Styles.smallColumn}>{co || 0}</p>
    </div>

    const renderPlayer = (player, index) => {
        const allegiance = JSON.parse(player.roster_stat)?.allegiance
        return <button key={index} id={Styles.playerContainer} onClick={handleClickPlayer(player)}>
            {renderRow(index + 1, `${player.surname} ${player.name}`, allegiance, player.win, player.draw, player.tp_sum, player.opp_p, index % 2)}
        </button>
    }
    
    return <>
        <div id={Styles.searchContainer}>
            <input id={Styles.input} onChange={handleSearch} placeholder='Поиск' autoFocus type='search' name='search' />
        </div>
        <div id='column' className='Chapter'>
            <div>
                {renderRow('№', 'Игрок', 'Армия', 'W', 'D', 'TO', 'CO', true)}
                {map(search.players, renderPlayer)}
            </div>
        </div>
    </>
}

export default Players
