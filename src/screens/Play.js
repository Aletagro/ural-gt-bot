import React, {useState, useEffect, useReducer} from 'react'
import {useNavigate} from 'react-router-dom'
import {rounds, players} from '../utilities/appState'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Constants from '../Constants'


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
    const [info, setInfo] = useState()
    const battleplan = Constants.tournamentBattleplans[rounds.active]

    useEffect(() => {
        fetch(`https://aoscom.online/round/?play=${user?.id}`)
            .then(response => response.json())
            .then(data => {
                const _data = {
                    players: [
                        {name: 'Рукосуев', id: 3},
                        {name: 'Удалов', id: 4}
                    ] 
                }
                setInfo(_data)
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

    const handleClickPlayer = (playerIndex) => () => {
        const player = info.players[playerIndex]
        console.log('handleClickPlayer', player)
        navigate('/roster', {state: {title: player.name, playerId: player.id}})
    }

    const handleClickBattleplan = () => {
        navigate('/battleplan', {state: {title:battleplan.title, battleplan}})
    }

    const handleSendResult = () => {
        // await fetch('https://aoscom.online/players/reg', {
        //     method: 'POST',
        //     body: JSON.stringify({tgId: user?.id, }),
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Accept': "application/json, text/javascript, /; q=0.01"
        //     }
        // })
        //     .then(response => response.json())
        //     .catch(error => console.error(error))
    }

    return <div id='column' className='Chapter'>
        <div id={Styles.inputContainer}>
            <div id={Styles.playerContainer}>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeFirstPlayerResult}
                    label={info?.players[0].name}
                    value={firstPlayer}
                />
                <button
                    id={Styles.rosterButton}
                    onClick={handleClickPlayer(0)}
                    disabled={firstPlayer || secondPlayer}
                >
                    Ростер
                </button>
            </div>
            <div id={Styles.playerContainer}>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeSecondPlayerResult}
                    label={info?.players[1].name}
                    value={secondPlayer}
                />
                <button
                    id={Styles.rosterButton}
                    onClick={handleClickPlayer(1)}
                    disabled={firstPlayer || secondPlayer}
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
            disabled={firstPlayer || secondPlayer}
        >
            Отправить Результаты
        </button>
        <p>Будьте внимательны, вводятся ваши VP, набранные за игру, а не TO </p>
    </div>
}

export default Play
