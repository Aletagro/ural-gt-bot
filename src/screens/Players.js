import React, {useState, useEffect, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {useScrollRestore} from '../utilities/useScrollRestore'
import {players, search, player, meta} from '../utilities/appState'
import General from '../icons/blackGeneral.svg'
import PaintIcon from '../icons/PaintIcon'
import Constants from '../Constants'

import map from 'lodash/map'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Players.module.css'
import SearchBar from '../components/SearchBar'

const lastColumnValues = {
    'TO': 'tp_sum',
    'Paint': 'my_paint',
    'Sport': 'my_sport',
}

const parseStat = (value) => {
    try {
        return JSON.parse(value) || {}
    } catch (e) {
        return {}
    }
}

const Players = () => {
    const navigate = useNavigate()
    // вернулись с карточки игрока: возвращаем прокрутку
    useScrollRestore('players')
    const [searchValue, setSearchValue] = useState(search.playersValue || '')
    // по запросу фильтруем с задержкой, пока человек печатает. При возврате на экран запрос применяется сразу
    const [query, setQuery] = useState(search.playersValue || '')
    const [lastColumn, setLastColumn] = useState(search.playersLastColumn || 'ТО')
    const [standing, setStanding] = useState(players.standing)

    useEffect(() => {
        const timeout = setTimeout(() => setQuery(searchValue), 300)
        return () => clearTimeout(timeout)
    }, [searchValue])

    // Список считается из таблицы и запроса, а не хранится отдельно: новая таблица с сервера не сбрасывает фильтр и ничего не мигает
    const list = useMemo(() => {
        const text = lowerCase(query)
        if (!text) return standing
        return filter(standing, (item) => {
            const rosterInfo = parseStat(item.roster_stat)
            return includes(lowerCase(`${item.surname} ${item.name}`), text) ||
                includes(lowerCase(rosterInfo.allegiance), text) ||
                includes(lowerCase(rosterInfo.grandAlliance), text) ||
                includes(lowerCase(item.city), text)
        })
    }, [standing, query])

    useEffect(() => {
        let stopped = false
        fetch(`${Constants.domain}/players/ranking`)
            .then(response => response.json())
            .then(data => {
                const _players = map(data.players, (_player, index) => ({..._player, place: index + 1}))
                players.standing = _players
                if (!stopped) setStanding(_players)
            })
            .catch(error => console.error(error))
        return () => {
            stopped = true
        }
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
        const newValue = lastColumn === 'ТО'
            ? 'Paint'
            : lastColumn === 'Paint'
                ? 'Sport'
                : 'ТО'
        search.playersLastColumn = newValue
        setLastColumn(newValue)
    }

    const renderRow = (place, _player, city, army, w, d, tp, last, isOddRow, withRoster, paintChecked, hasPhoto, isHeader) => <div className={`${Styles.row} ${isHeader ? Styles.header : isOddRow ? Styles.odd : ''} ${!isHeader && place <= 3 ? Styles[`place${place}`] : ''}`}>
        <p id={Styles.smallColumn}>{place}</p>
        <div id={Styles.playerInfo}>
            <p id={Styles.сolumn}>{_player}</p>
            {city ? <p id={Styles.subtitle}>{city}</p> : null}
        </div>
        {meta.round || !meta.isRostersShow
            ? <>
                <p className={Styles.armyCell}>{army}</p>
                <p id={Styles.winsColumn} className={!isHeader && !w && !d ? Styles.zero : ''}>
                    {isHeader ? 'W' : w || 0}
                    {!isHeader && d ? <span className={Styles.draws}>({d})</span> : null}
                </p>
                <p id={Styles.smallColumn} className={isHeader ? '' : tp ? Styles.score : Styles.zero}>{tp || 0}</p>
                <p id={Styles.smallColumn} className={!isHeader && !last ? Styles.zero : ''}>{last || 0}</p>
            </>
            : <>
                {withRoster
                    ? <img id={Styles.rosterIcon} src={General} alt="" />
                    : null
                }
                {player.isJudge && hasPhoto
                    ? paintChecked
                        ? <PaintIcon id={Styles.painIcon} /> 
                        : <PaintIcon crossed id={Styles.painIcon} />
                    : null
                }
            </>
        }
    </div>

    const renderPlayer = (player, index) => {
        const allegiance = parseStat(player.roster_stat).allegiance
        return <button key={index} id={Styles.playerContainer} onClick={handleClickPlayer(player)}>
            {renderRow(player.place, `${player.surname} ${player.name}`, player.city, allegiance, player.win, player.draw, player.final_formula, player[lastColumnValues[lastColumn]] || (player[lastColumnValues[lastColumn]] === 0 ? 0 : player.tp_sum), index % 2, player.roster_stat, player.paint_checked, player.has_photo)}
        </button>
    }

    return <>
        <SearchBar onChange={handleSearch} defaultValue={searchValue || ''} />
        {player.isJudge
            ? <p id={Styles.lastColumnContainer} onClick={handleChangeLastColumn}>Что отображать в последнем столбце: <b>{lastColumn}</b></p>
            : null
        }
        <div id='column' className='Chapter'>
            {isEmpty(list) && query
                ? <p id={Styles.empty}>Игроков, соответствующий поиску не найдено</p>
                : <div className={Styles.table}>
                    {renderRow('№', 'Игрок', undefined, 'Армия', 'W', 'D', 'ИО', lastColumn, false, undefined, undefined, undefined, true)}
                    {map(list, renderPlayer)}
                </div>
            }
        </div>
    </>
}

export default Players
