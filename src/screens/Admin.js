import React, {useState, useCallback, useReducer} from 'react'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import {setTournamentStatus} from '../utilities/utils'
import Checkbox from '../components/Checkbox'
import {players, meta} from '../utilities/appState'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import remove from 'lodash/remove'
import isEmpty from 'lodash/isEmpty'

import Styles from './styles/Admin.module.css'

const Admin = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [pairings, setPairings] = useState([])
    const [playersForChange, setPlayersForChange] = useState([])
    const isChangeButtonDisabled = size(playersForChange) !== 2

    // const handleChangeParam = useCallback(async () => {
    //     await fetch(`https://aoscom.online/players/something/?id=${playerId}&column=${key}&value=${value}`, {
    //         method: 'PUT'
    //     })
    //         .then(response => response.json())
    //         .catch(error => console.error(error))
    // }, [playerId, key, value])

    const handleCreateParings = useCallback(async () => {
        await fetch(`https://aoscom.online/parings/?next_round=${meta.round + 1}`)
            .then(response => response.json())
            .then(data => {
                setPairings(data)
            })
            .catch(error => console.error(error))
    }, [])

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
        toast.success('Паринги изменены', Constants.toastParams)
    }

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

    const handleFinishRoundMeta = useCallback(async () => {
        await fetch('https://aoscom.online/tournament-meta/any_state', {
            method: 'PUT',
            body: JSON.stringify({round: meta.round, isRoundActive: false}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                handleGetMeta()
                toast.success('Раунд окончен', Constants.toastParams)
            })
            .catch(error => console.error(error))
    }, [handleGetMeta])

    const handleSetOppPower = useCallback(async () => {
        fetch('https://aoscom.online/rounds/opp_power/', {
            method: 'PUT'
        })
            .catch(error => console.error(error))
    }, [])

    const handleFinishRound = useCallback(async () => {
        handleFinishRoundMeta()
        handleSetOppPower()
    }, [handleFinishRoundMeta, handleSetOppPower])

    const handleStartRoundMeta = useCallback(async () => {
        await fetch('https://aoscom.online/tournament-meta/any_state', {
            method: 'PUT',
            body: JSON.stringify({round: meta.round + 1, isRoundActive: true}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                handleGetMeta()
            })
            .catch(error => console.error(error))
    }, [handleGetMeta])


    const handleStartRound = useCallback(async () => {
        await fetch(`https://aoscom.online/parings/update_parings/?next_round=${meta.round}`, {
            method: 'PUT',
            body: JSON.stringify(pairings),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                handleStartRoundMeta()
                toast.success('Раунд начался', Constants.toastParams)
            })
            .catch(error => {
                console.error(error)
                toast.error('Произошла ошибка, пиши Никите', Constants.toastParams)
            })
    }, [pairings, handleStartRoundMeta])

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
        <b id={Styles.text}>Состояние турнира</b>
        <p id={Styles.text}>Статус: {setTournamentStatus(meta.isRoundActive, meta.round)}</p>
        <button id={meta.isRoundActive ? Styles.disableButton : Styles.button} onClick={handleCreateParings} disabled={meta.isRoundActive}>Создать паринги {meta.round + 1} раунда</button>
        {isEmpty(pairings)
            ? null
            : <>
                <b id={Styles.text}>Паринги</b>
                <div>
                    {map(pairings, renderPairing)}
                </div>
                <button id={isChangeButtonDisabled ? Styles.disableButton : Styles.button} onClick={handleChangePlayers} disabled={isChangeButtonDisabled}>
                    Запарить выбранных игроков друг на друга
                </button>
                <button id={Styles.button} onClick={handleStartRound}>Начать новый раунд</button>
            </>
        }
        <button id={!meta.isRoundActive ? Styles.disableButton : Styles.button} onClick={handleFinishRound} disabled={!meta.isRoundActive}>Закончить раунд</button>
        <ToastContainer />
    </div>
}

export default Admin
