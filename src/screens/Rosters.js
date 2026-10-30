import React, {useEffect, useState, useReducer} from 'react'
import useDebounce from '../utilities/useDebounce'
import {useNavigate} from 'react-router-dom'
import {ToastContainer} from 'react-toastify'
import {players, search} from '../utilities/appState'
import {sortByName, getArmyImage} from '../utilities/utils'
import {useRosterPdf} from '../utilities/useRosterPdf'
import Constants from '../Constants'

import map from 'lodash/map'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Rosters.module.css'
import SearchBar from '../components/SearchBar'

const Rosters = ({setShareAction}) => {
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
            fetch(`${Constants.domain}/rosters/`)
                .then(response => response.json())
                .then(data => {
                    players.rosters = data
                    setSearchValue('')
                })
                .catch(error => console.error(error))
        }
    }, [])

    const {start: handleDownloadRosters, readyModal} = useRosterPdf()

    useEffect(() => {
        setShareAction(() => handleDownloadRosters)
        return () => setShareAction(null)
    }, [setShareAction, handleDownloadRosters])

    const handleClickPlayer = (player, index) => () => {
        navigate('/roster', {state: {title: `${player.surname} ${player.name}`, playerId: player.id, playerIndex: index}})
    }

    const handleSearch = (e) => {
        search.rostersValue = e.target.value
        setSearchValue(e.target.value)
    }

    const renderRow = (number, player, army, isOddRow, city, isHeader) => <div className={`${Styles.row} ${isHeader ? Styles.header : isOddRow ? Styles.odd : ''}`}>
        <p id={Styles.smallColumn}>{number}</p>
        <div id={Styles.playerInfo}>
            <p id={Styles.сolumn}>{player}</p>
            {city ? <p id={Styles.subtitle}>{city}</p> : null}
        </div>
        <div className={Styles.armyCell}>
            {!isHeader && getArmyImage(army)
                ? <img className={Styles.armyThumb} src={getArmyImage(army)} loading='lazy' alt='' />
                : null
            }
            <span>{army}</span>
        </div>
    </div>

    const renderRoster = (player, index) => {
        const allegiance = JSON.parse(player.roster_stat)?.allegiance
        return <button key={player.id} id={Styles.playerContainer} onClick={handleClickPlayer(player, index)}>
            {renderRow(index + 1, `${player.surname} ${player.name}`, allegiance, index % 2, player.city)}
        </button>
    }
    
    return <>
        <SearchBar onChange={handleSearch} />
        <div id='column' className='Chapter'>
            {isEmpty(search.rosters) && searchValue
                ? <p id={Styles.empty}>Игроков, соответствующий поиску не найдено</p>
                : <div className={Styles.table}>
                    {renderRow('№', 'Игрок', 'Армия', false, undefined, true)}
                    {map(search.rosters, renderRoster)}
                </div>
            }
        </div>
        <ToastContainer />
        {readyModal}
    </>
}

export default Rosters
