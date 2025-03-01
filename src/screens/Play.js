import React, {useState, useEffect, useReducer, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {players, meta} from '../utilities/appState'
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
    const battleplan = Constants.tournamentBattleplans[meta.round - 1]

    useEffect(() => {
        fetch(`https://aoscom.online/rounds/play/?tg_id=${user?.id}&cur_round=${meta.round}`)
            .then(response => response.json())
            .then(data => {
                if (data.results_submitted) {
                    setIsFinished(true)
                } else {
                    const firstPlayer = find(players.data, ['id', data.first_player_id])
                    const secondPlayer = find(players.data, ['id', data.second_player_id])
                    setInfo({
                        ...data,
                        firstPlayer,
                        secondPlayer
                    })
                }
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
        await fetch(`https://aoscom.online/rounds/play/?cur_round=${info?.round}&cur_table=${info?.table}&vp_first=${firstPlayer}&vp_second=${secondPlayer}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .then(data => {
                setIsFinished(true)
            })
            .catch(error => console.error(error))
    }, [firstPlayer, secondPlayer, info?.round, info?.table])

    const handleJudgeCall = () => {
        fetch(`https://aoscom.online/messages/judges_call?tg_id=${user?.id}`)
            .then(response => response.json())
            .catch(error => console.error(error))
    }

    const handleClickTactics = () => {
        navigate('/tactics')
    }

    if (isFinished) {
        return <div id='column' className='Chapter'>
            <b id={Styles.result}>Результат вашей игры принят</b>
        </div>
    }

    return <div id='column' className='Chapter'>
        <b id={Styles.table} >Стол {info?.table}</b>
        <div id={Styles.inputContainer}>
            <div id={Styles.playerContainer}>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeFirstPlayerResult}
                    label={info?.firstPlayer?.surname}
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
                    label={info?.secondPlayer?.surname}
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
        {battleplan
            ? <button
                id={Styles.rosterButton}
                onClick={handleClickBattleplan}
            >
                Миссиия: {battleplan.title}
            </button>
            : null
        }
        <button id={Styles.rosterButton} onClick={handleClickTactics}>Тактики</button>
        <button
            id={firstPlayer && secondPlayer ? Styles.button : Styles.disableButton}
            onClick={handleSendResult}
            disabled={!firstPlayer || !secondPlayer}
        >
            Отправить Результаты
        </button>
        <p id={Styles.noticed}>Будьте внимательны, вводятся ваши VP, набранные за игру, а не TO </p>
        <button id={Styles.button} onClick={handleJudgeCall}>Вызвать Судью</button>
    </div>
}

export default Play
