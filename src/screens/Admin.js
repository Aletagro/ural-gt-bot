import React, {useState, useCallback} from 'react'
import FloatingLabelInput from '../components/FloatingLabelInput'
import {players} from '../utilities/appState'

import map from 'lodash/map'
import find from 'lodash/find'

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
    const [playerId, setPlayerId] = useState('')
    const [key, setKey] = useState('')
    const [value, setValue] = useState('')
    const [round, setRound] = useState('1')
    const [pairings, setPairings] = useState([])
    const [firstP, setFirstP] = useState('')
    const [secondP, setSecondP] = useState('')
    const [newRound, setNewRound] = useState(0)
    const [newStatus, setNewStatus] = useState(0)

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

    const handleChangeFirstP = (e) => {
        setFirstP(e.target.value)
    }

    const handleChangeSecondP = (e) => {
        setSecondP(e.target.value)
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
        if (firstP && secondP) {
            const newPairings = {...pairings}
            const first = firstP.split('-')
            const second = secondP.split('-')

            const firstId = newPairings[first[0]][first[1] - 1]
            let firstNewPlay = [...newPairings[second[0]]]
            firstNewPlay[second[1] - 1] = firstId
            const secondId = newPairings[second[0]][second[1] - 1]
            let secondNewPlay = [...newPairings[first[0]]]
            secondNewPlay[first[1] - 1] = secondId
            
            newPairings[second[0]] = firstNewPlay.sort((a, b) => a - b)
            newPairings[first[0]] = secondNewPlay.sort((a, b) => a - b)
            setPairings(newPairings)
        }
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
      
    const handleChangeMeta = useCallback(async () => {
        await fetch('https://aoscom.online/tournament-meta/any_state', {
            method: 'PUT',
            body: JSON.stringify({round: newRound, isRoundActive: newStatus}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => response.json())
            .catch(error => console.error(error))
    }, [newRound, newStatus])

    const renderPairing = (pairing, index) => {
        const firstPlayer = find(players.data, ['id', pairing[0]])
        if (!firstPlayer) {
            return null
        }
        const firstPlayerArmy = JSON.parse(firstPlayer?.roster_stat)?.allegiance
        const secondPlayer = find(players.data, ['id', pairing[1]])
        const secondPlayerArmy = JSON.parse(secondPlayer?.roster_stat)?.allegiance
        return <div id={Styles.play} key={index}>
            <h3 id={Styles.text}>Стол {index}</h3>
            <div id={Styles.player}>
                <b>Первый игрок</b>
                <p>Имя: {firstPlayer?.surname} {firstPlayer?.name}</p>
                <p>id: {firstPlayer?.id}</p>
                <p>Город: {firstPlayer?.city}</p>
                <p>Армия: {firstPlayerArmy}</p>
            </div>
            <div id={Styles.player}>
                <b>Второй игрок</b>
                <p>Имя: {secondPlayer?.surname} {secondPlayer?.name}</p>
                <p>id: {secondPlayer?.id}</p>
                <p>Город: {secondPlayer?.city}</p>
                <p>Армия: {secondPlayerArmy}</p>
            </div>
        </div>
    }
    console.log(pairings)

    return <div id='column' className='Chapter'>
        <p id={Styles.text}>Мета</p>
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
        <b id={Styles.text}>Изменение парингов</b>
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeFirstP}
            label='Первый игрок (Стол-Игрок)'
            placeholder='3-1'
            value={firstP}
        />
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeSecondP}
            label='Второй игрок (Стол-Игрок)'
            placeholder='7-2'
            value={secondP}
        />
        <button id={Styles.button} onClick={handleChangePlayers}>Поменять игроков</button>
        <b id={Styles.text}>Паринги</b>
        <div>
            {map(pairings, renderPairing)}
        </div>
        <button id={Styles.button} onClick={handleStartRound}>Начать новый раунд</button>
    </div>
}

export default Admin
