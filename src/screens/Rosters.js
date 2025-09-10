import React, {useEffect, useState, useReducer} from 'react'
import useDebounce from '../utilities/useDebounce'
import {useNavigate} from 'react-router-dom'
import {players, search} from '../utilities/appState'
import {sortByName} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Rosters.module.css'

const Rosters = () => {
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState(search.rostersValue)
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    useDebounce(() => {
        if (searchValue) {
            const _rosters = filter(players.rosters, (player) => {
                const rosterInfo = JSON.parse(player.roster_stat) || {}
                return includes(lowerCase(`${player.surname} ${player.name}`), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo?.allegiance), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo.grandAlliance), lowerCase(searchValue)) ||
                    includes(lowerCase(player.city), lowerCase(searchValue))
            })
            search.rosters = sortByName(_rosters)

        } else {
            search.rosters = sortByName(players.rosters, 'surname')
        }
        forceUpdate()
      }, [searchValue], 300
    )

    useEffect(() => {
        if (!players.rosters.length) {
            fetch('https://aoscom.online/rosters/')
                .then(response => response.json())
                .then(data => {
                    players.rosters = data
                    setSearchValue('')
                })
                .catch(error => console.error(error))
        }
    }, [])

    const handleClickPlayer = (player, index) => () => {
        navigate('/roster', {state: {title: `${player.surname} ${player.name}`, playerId: player.id, playerIndex: index}})
    }

    const handleSearch = (e) => {
        search.rostersValue = e.target.value
        setSearchValue(e.target.value)
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
    
    return <>
        <div id={Styles.searchContainer}>
            <input id={Styles.input} onChange={handleSearch} placeholder='Поиск' autoFocus type='search' name='search' />
        </div>
        <div id='column' className='Chapter'>
            <div>
                {renderRow('№', 'Игрок', 'Армия', true)}
                {map(search.rosters, renderRoster)}
            </div>
        </div>
    </>
}

export default Rosters
