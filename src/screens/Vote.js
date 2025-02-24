import React, {useState, useCallback} from 'react'
import {useLocation} from 'react-router-dom'
import FloatingLabelInput from '../components/FloatingLabelInput'
import {player} from '../utilities/appState'

import map from 'lodash/map'
import get from 'lodash/get'

import Styles from './styles/Vote.module.css'

const tg = window.Telegram.WebApp

const inputStyle = {
    '--Input-minHeight': '48px',
    'borderRadius': '4px',
    'marginBottom': '16px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}

const Vote = () => {
    const user = tg.initDataUnsafe?.user
    const {type} = useLocation().state
    const isPaint = type === 'paint'
    const [result, setResult] = useState(isPaint ? [0, 0, 0] : [0, 0])
    let opponents = []
    
    const getOpponent = (value) => get(player, `info.game_${value}_opp`)

    if (!isPaint) {
        opponents = map([1, 2, 3, 4, 5], getOpponent)
    }
    console.log(opponents)

    const handleChangeResult = (index) => (e) => {
        const newResult = [...result]
        newResult[index] = e.target.value
        setResult(newResult)
    }

    const handleFocus = (e) => {
        e.target.select()
    }

    const handleClickVote = useCallback(async () => {
        await fetch('https://aoscom.online/vote/', {
            method: 'POST',
            body: JSON.stringify({tg_id: user?.id, type, choice: `${result}`}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => response.json())
            .catch(error => console.error(error))
    }, [result, type, user?.id])

    const renderInput = (_, index) => <FloatingLabelInput
        style={inputStyle}
        onChange={handleChangeResult(index)}
        label={`${index + 1} Выбор`}
        value={result[index] || undefined}
        onFocus={handleFocus}
    />

    const renderOpponent = (Opponent) => <button id={Styles.button} onClick={handleClickVote}>{Opponent}</button>

    return <div id='column' className='Chapter'>
        {isPaint
            ? <p id={Styles.text}>Введите номера игроков, чья армия вам понравилась больше всего</p>
            : <p id={Styles.text}>Выберите номера игроков, с которыми у вас были самые приятные игры</p>
        }
        {isPaint
            ? map(result, renderInput)
            : map(opponents, renderOpponent)
        }
        <button id={Styles.sendButton} onClick={handleClickVote}>Проголосовать</button>
    </div>
}

export default Vote
