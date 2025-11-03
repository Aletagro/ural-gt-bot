import React, {useState, useCallback} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import FloatingLabelInput from '../components/FloatingLabelInput'
import {player, players} from '../utilities/appState'

import map from 'lodash/map'
import get from 'lodash/get'
import find from 'lodash/find'
import size from 'lodash/size'
import findIndex from 'lodash/findIndex'

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
    const navigate = useNavigate()
    const {type} = useLocation().state
    const isPaint = type === 'paint'
    const [result, setResult] = useState(isPaint ? [0, 0, 0] : [])
    const disabledSendButton = isPaint
        ? result.includes(0)
        : size(result) !== 1
    let opponents = []
    
    const getOpponent = (value) => {
        const oppIndex = get(player, `info.game_${value}_opp`)
        const opp = find(players.data, ['id', oppIndex])
        return {name: `${opp?.surname} ${opp?.name}`, id: oppIndex}
    }

    if (!isPaint) {
        opponents = map([1, 2, 3, 4, 5, 6], getOpponent)
    }

    const handleChangeResult = (index) => (e) => {
        const newResult = [...result]
        newResult[index] = e.target.value || 0
        setResult(newResult)
    }

    const handleFocus = (e) => {
        e.target.select()
    }

    const handleClickVote = useCallback(async () => {
        await fetch(`https://aoscom.online/vote/?tg_id=${user?.id}&v_type=${type}&plrs=${result}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .catch(error => console.error(error))
        navigate('/')
    }, [result, type, user?.id, navigate])

    const handleClickOpp = (id) => () => {
        const newResult = [...result]
        if (newResult.includes(id)) {
            const index = findIndex(newResult, (res) => res === id)
            newResult.splice(index, 1)
        } else {
            if (size(newResult) === 1) {
                newResult.shift()
            }
            newResult.push(id)
        }
        setResult(newResult)
    }

    const renderInput = (_, index) => <FloatingLabelInput
        key={index}
        style={inputStyle}
        onChange={handleChangeResult(index)}
        label={`${index + 1} Выбор`}
        value={result[index] || undefined}
        onFocus={handleFocus}
    />

    const renderOpponent = (opponent) => <button key={opponent.id} id={result.includes(opponent.id) ? Styles.selectedButton : Styles.button} onClick={handleClickOpp(opponent.id)}>{opponent.name}</button>

    return <div id='column' className='Chapter'>
        {isPaint
            ? <p id={Styles.text}>Введите номера игроков, чья армия вам понравилась больше всего</p>
            : <p id={Styles.text}>Выберите игрока, с которыми у вас была самая приятная игра</p>
        }
        {isPaint
            ? map(result, renderInput)
            : map(opponents, renderOpponent)
        }
        <button disabled={disabledSendButton} id={disabledSendButton ? Styles.disabledSendButton : Styles.sendButton} onClick={handleClickVote}>Проголосовать</button>
    </div>
}

export default Vote
