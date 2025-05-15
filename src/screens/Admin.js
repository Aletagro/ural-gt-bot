import React, {useState, useCallback, useReducer} from 'react'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Checkbox from '../components/Checkbox'
import {players, meta} from '../utilities/appState'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import remove from 'lodash/remove'

import Styles from './styles/Admin.module.css'

const inputStyle = {
    '--Input-minHeight': '48px',
    'borderRadius': '4px',
    'marginBottom': '16px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}

const Admin = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [playerId, setPlayerId] = useState('')
    const [key, setKey] = useState('')
    const [value, setValue] = useState('')
    const [round, setRound] = useState('1')
    const [pairings, setPairings] = useState([])
    const [playersForChange, setPlayersForChange] = useState([])
    const [newRound, setNewRound] = useState()
    const [newStatus, setNewStatus] = useState()
    const isChangeButtonDisabled = size(playersForChange) !== 2

    const handleChangePlayerId = (e) => {
        setPlayerId(e.target.value)
    }

    const handleChangeKey = (e) => {
        setKey(e.target.value)
    }

    const handleChangeValue = (e) => {
        setValue(e.target.value)
    }

    const handleSetRound = (e) => {
        setRound(e.target.value)
    }

    const handleChangeNewRound = (e) => {
        setNewRound(e.target.value)
    }

    const handleChangeNewStatus = (e) => {
        setNewStatus(e.target.value)
    }

    const handleChangeParam = useCallback(async () => {
        await fetch(`https://aoscom.online/players/something/?id=${playerId}&column=${key}&value=${value}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .catch(error => console.error(error))
    }, [playerId, key, value])

    const handleCreateParings = useCallback(async () => {
        await fetch(`https://aoscom.online/parings/?next_round=${round}`)
            .then(response => response.json())
            .then(data => {
                setPairings(data)
            })
            .catch(error => console.error(error))
    }, [round])

    const handleChangePlayers = () => {
        const newPairings = {...pairings}
        const firstPlayer = playersForChange[0]
        const secondPlayer = playersForChange[1]
        
        const oldFirstPlayerTable = newPairings[firstPlayer[0]]
        const oldSecondPlayerTable = newPairings[secondPlayer[0]]

        const newCheckedPlayersTable = [firstPlayer[1], secondPlayer[1]]
        const firstRemainingPlayer = find(oldFirstPlayerTable, p => p !== firstPlayer[1])
        const secondRemainingPlayer = find(oldSecondPlayerTable, p => p !== secondPlayer[1])
        const newRemainingPlayersTable = [firstRemainingPlayer, secondRemainingPlayer]
        
        newPairings[firstPlayer[0]] = newCheckedPlayersTable.sort((a, b) => a - b)
        newPairings[secondPlayer[0]] = newRemainingPlayersTable.sort((a, b) => a - b)
        setPairings(newPairings)
        setPlayersForChange([])
    }

    const handleStartRound = useCallback(async () => {
        await fetch(`https://aoscom.online/parings/update_parings/?next_round=${round}`, {
            method: 'PUT',
            body: JSON.stringify(pairings),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => response.json())
            .catch(error => console.error(error))
    }, [pairings, round])

    const handleGetMeta = useCallback(async () => {
        fetch('https://aoscom.online/tournament-meta/')
            .then(response => response.json())
            .then(data => {
                meta.round = Number(data.round)
                meta.isRoundActive = Number(data.isRoundActive)
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])
      
    const handleChangeMeta = useCallback(async () => {
        await fetch('https://aoscom.online/tournament-meta/any_state', {
            method: 'PUT',
            body: JSON.stringify({round: newRound, isRoundActive: newStatus}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                handleGetMeta()
            })
            .catch(error => console.error(error))
    }, [newRound, newStatus, handleGetMeta])

    const handleCheckPlayer = (id, table) => (checked) => {
        let newData = [...playersForChange]
        if (checked) {
            newData.push([table, id])
        } else {
            newData = remove(newData, p => {
                return p[1] !== id
            })
        }
        setPlayersForChange(newData)
    }

    const renderPlayer = (player, table, isFirst) => {
        const playerArmy = JSON.parse(player?.roster_stat)?.allegiance
        const isChecked = find(playersForChange, p => p[1] === player?.id)
        return <div id={Styles.player}>
            <b>{isFirst ? 'Первый' : 'Второй'} игрок</b>
            <p>Имя: {player?.surname} {player?.name}</p>
            <p>id: {player?.id}</p>
            <p>Город: {player?.city}</p>
            <p>Армия: {playerArmy}</p>
            <Checkbox
                onClick={handleCheckPlayer(player?.id, Number(table))}
                checked={isChecked}
                disabled={!isChecked && size(playersForChange) >= 2}
            />
        </div>
    }

    const renderPairing = (pairing, index) => {
        const firstPlayer = find(players.data, ['id', pairing[0]])
        if (!firstPlayer) {
            return null
        }
        const secondPlayer = find(players.data, ['id', pairing[1]])
        return <div id={Styles.play} key={index}>
            <h3 id={Styles.text}>Стол {index}</h3>
            {renderPlayer(firstPlayer, index, true)}
            {renderPlayer(secondPlayer, index)}
        </div>
    }

    return <div id='column' className='Chapter'>
        <b id={Styles.text}>Мета</b>
        <p id={Styles.text}>Раунд - {meta.round || 0}</p>
        <p id={Styles.text}>Статус Раунда - {meta.isRoundActive ? 'Активен' : 'Не Активен'}</p>
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeNewRound}
            label='Установить Раунд'
            value={newRound}
        />
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeNewStatus}
            label='Установить Статус'
            placeholder='1 - активен, 0 - не активен'
            value={newStatus}
        />
        <button id={Styles.button} onClick={handleChangeMeta}>Изменить мету</button>
        <p id={Styles.text}>Изменить параметр игрока</p>
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangePlayerId}
            label='ID игрока'
            value={playerId}
        />
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeKey}
            label='Параметр'
            value={key}
        />
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeValue}
            label='Значение'
            value={value}
        />
        <button id={Styles.button} onClick={handleChangeParam}>Изменить параметр</button>
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleSetRound}
            label='№ следующего раунда'
            value={round}
        />
        <button id={Styles.button} onClick={handleCreateParings}>Создать паринги нового раунда</button>
        {pairings
            ? <>
                <b id={Styles.text}>Паринги</b>
                <div>
                    {map(pairings, renderPairing)}
                </div>
                <button id={isChangeButtonDisabled ? Styles.disableButton : Styles.button} onClick={handleChangePlayers} disabled={isChangeButtonDisabled}>
                    Запарить выбранных игроков друг на друга
                </button>
            </>
            : null
        }
        <button id={Styles.button} onClick={handleStartRound}>Начать новый раунд</button>
    </div>
}

export default Admin
