import React, {useState, useEffect, useReducer, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {rounds, players} from '../utilities/appState'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Constants from '../Constants'

import find from 'lodash/find'

import Styles from './styles/Play.module.css'

const tg = window.Telegram.WebApp

const inputStyle = {
    '--Input-minHeight': '48px',
    'width': '100%',
    'borderRadius': '4px',
    'marginBottom': '16px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}

const Play = () => {
    const navigate = useNavigate()
    const user = tg.initDataUnsafe?.user
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [firstPlayer, setFirstPlayer] = useState()
    const [secondPlayer, setSecondPlayer] = useState()
    const [isFinished, setIsFinished] = useState(false)
    const [info, setInfo] = useState()
    const battleplan = Constants.tournamentBattleplans[rounds.active]

    useEffect(() => {
        fetch('https://aoscom.online/tournament-meta/')
            .then(response => response.json())
            .then(data => {
                fetch(`https://aoscom.online/round/?play=${user?.id}&round=${data.round}`)
                .then(response => response.json())
                .then(data => {
                    const _data = {
                        id: 17,
                        table: 1,
                        first_player_id: 1,
                        first_player_vp: 0,
                        second_player_id: 2,
                        second_player_vp: 0,
                        results_submitted: false
                    }
                    if (_data.results_submitted) {
                        setIsFinished(true)
                    } else {
                        const firstPlayer = find(players.data, ['id', _data.first_player_id])
                        const secondPlayer = find(players.data, ['id', _data.second_player_id])
                        setInfo({
                            ..._data,
                            firstPlayer,
                            secondPlayer
                        })
                    }
                })
                .catch(error => console.error(error))
            })
            .catch(error => console.error(error))
    }, [user?.id])

    useEffect(() => {
        if (!players.rosters.length) {
            fetch('https://aoscom.online/rosters/')
                .then(response => response.json())
                .then(data => {
                    players.rosters = data
                    forceUpdate()
                })
        }
    }, [])

    const handleChangeFirstPlayerResult = (e) => {
        setFirstPlayer(e.target.value)
    }

    const handleChangeSecondPlayerResult = (e) => {
        setSecondPlayer(e.target.value)
    }

    const handleClickFirstPlayerRoster = () => {
        navigate('/roster', {state: {title: `${info.firstPlayer.surname} ${info.firstPlayer.name}`, playerId: info.firstPlayer.id, isInfo: true}})
    }

    const handleClickSecondPlayerRoster = () => {
        navigate('/roster', {state: {title: `${info.secondPlayer.surname} ${info.secondPlayer.name}`, playerId: info.secondPlayer.id, isInfo: true}})
    }

    const handleClickBattleplan = () => {
        navigate('/battleplan', {state: {title:battleplan.title, battleplan}})
    }

    const handleSendResult = useCallback(async () => {
        await fetch('https://aoscom.online/rounds/play', {
            method: 'PUT',
            body: JSON.stringify({
                id: info?.id,
                first_player_vp: firstPlayer,
                second_player_vp: secondPlayer
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => response.json())
            .then(data => {
                setIsFinished(true)
            })
            .catch(error => console.error(error))
    }, [info?.id, firstPlayer, secondPlayer])

    if (isFinished) {
        return <div id='column' className='Chapter'>
            <b id={Styles.result}>Результат вашей игры принят</b>
        </div>
    }

    return <div id='column' className='Chapter'>
        <div id={Styles.inputContainer}>
            <div id={Styles.playerContainer}>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeFirstPlayerResult}
                    label={info?.firstPlayer.surname}
                    value={firstPlayer}
                />
                <button
                    id={Styles.rosterButton}
                    onClick={handleClickFirstPlayerRoster}
                >
                    Ростер
                </button>
            </div>
            <div id={Styles.playerContainer}>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeSecondPlayerResult}
                    label={info?.secondPlayer.surname}
                    value={secondPlayer}
                />
                <button
                    id={Styles.rosterButton}
                    onClick={handleClickSecondPlayerRoster}
                >
                    Ростер
                </button>
            </div>
        </div>
        <button
            id={Styles.rosterButton}
            onClick={handleClickBattleplan}
        >
            Миссиия: {battleplan.title}
        </button>
        <button
            id={firstPlayer && secondPlayer ? Styles.button : Styles.disableButton}
            onClick={handleSendResult}
            // disabled={firstPlayer || secondPlayer}
        >
            Отправить Результаты
        </button>
        <p>Будьте внимательны, вводятся ваши VP, набранные за игру, а не TO </p>
    </div>
}

export default Play
