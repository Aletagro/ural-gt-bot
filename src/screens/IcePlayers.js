import React, {useState, useEffect, useReducer} from 'react'
import {useNavigate} from 'react-router-dom'
import useDebounce from '../utilities/useDebounce'
import {players, search, player, meta} from '../utilities/appState'
import General from '../icons/blackGeneral.svg'
import PaintChecked from '../icons/paintChecked.svg'

import map from 'lodash/map'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Players.module.css'

const lastColumnValues = {
    'TO': 'tp_sum',
    'Paint': 'my_paint',
    'Sport': 'my_sport',
}

const Players = () => {
    const navigate = useNavigate()
    const [searchValue, setSearchValue] = useState(search.playersValue)
    const [lastColumn, setLastColumn] = useState('ИО')
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    useDebounce(() => {
        if (searchValue) {
            const _players = filter(players.standing, (player) => {
                const rosterInfo = JSON.parse(player.roster_stat) || {}
                return includes(lowerCase(`${player.surname} ${player.name}`), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo?.allegiance), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo.grandAlliance), lowerCase(searchValue)) ||
                    includes(lowerCase(player.city), lowerCase(searchValue))
            })
            search.players = _players
        } else {
            search.players = players.standing
        }
        forceUpdate()
      }, [searchValue], 300
    )

    useEffect(() => {
        fetch('https://aoscom.online/players/ice_ranking')
            .then(response => response.json())
            .then(data => {
                const _players = map(data.players, (_player, index) => ({..._player, place: index + 1}))
                players.standing = _players
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

    const handleClickPlayer = (_player) => () => {
        if (meta.round || meta.isRostersShow || player.isJudge) {
            navigate('/playerInfo', {state: {player: _player, title: `${_player.surname} ${_player.name}`}})
        }
    }

    const handleSearch = (e) => {
        search.playersValue = e.target.value
        setSearchValue(e.target.value)
    }

    const handleChangeLastColumn = () => {
        const newValue = lastColumn === 'ИО'
            ? 'Paint'
            : lastColumn === 'Paint'
                ? 'Sport'
                : 'ИО'
        setLastColumn(newValue)
    }

    const renderRow = (place, player, city, army, w, d, tp, last, isOddRow, withRoster, paintChecked) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.smallColumn}>{place}</p>
        <div id={Styles.playerInfo}>
            <p id={Styles.сolumn}>{player}</p>
            {city ? <p id={Styles.subtitle}>{city}</p> : null}
        </div>
        {meta.round || meta.isRostersShow
            ? <>
                <p id={Styles.сolumn}>{army}</p>
                <p id={Styles.extraSmallColumn}>{w || 0}</p>
                <p id={Styles.extraSmallColumn}>{d || 0}</p>
                <p id={Styles.smallColumn}>{tp || 0}</p>
                <p id={Styles.smallColumn}>{last || 0}</p>
            </>
            : <>
                {withRoster
                    ? <img id={Styles.rosterIcon} src={General} alt="" />
                    : null
                }
                {player.isJudge && paintChecked
                    ? <img id={Styles.rosterIcon} src={PaintChecked} alt="" />
                    : null
                }
            </>
        }
    </div>

    const renderPlayer = (player, index) => {
        const allegiance = JSON.parse(player.roster_stat)?.allegiance
        return <button key={index} id={Styles.playerContainer} onClick={handleClickPlayer(player)}>
            {renderRow(player.place, `${player.surname} ${player.name}`, player.city, allegiance, player.win, player.draw, player.final_formula, player[lastColumnValues[lastColumn]], index % 2, player.roster, player.paint_checked)}
        </button>
    }

    return <>
        <div id={Styles.searchContainer}>
            <input id={Styles.input} onChange={handleSearch} placeholder='Поиск' autoFocus type='search' name='search' />
        </div>
        {player.isJudge
            ? <p id={Styles.lastColumnContainer} onClick={handleChangeLastColumn}>Что отображать в последнем столбце: <b>{lastColumn}</b></p>
            : null
        }
        <div id='column' className='Chapter'>
            <div>
                {renderRow('№', 'Игрок', undefined, 'Армия', 'W', 'D', 'ИО', lastColumn, true)}
                {map(search.players, renderPlayer)}
            </div>
        </div>
    </>
}

export default Players
