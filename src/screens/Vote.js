import React, {useState, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {player, players} from '../utilities/appState'
import Constants from '../Constants'

import map from 'lodash/map'
import get from 'lodash/get'
import find from 'lodash/find'
import size from 'lodash/size'
import findIndex from 'lodash/findIndex'

import Styles from './styles/Vote.module.css'
import Button from '../components/Button'

const Vote = () => {
    const navigate = useNavigate()
    const [result, setResult] = useState([player?.info?.best_opp || 0])
    const disabledSendButton = size(result) !== 1
    
    const getOpponent = useCallback((value) => {
        const oppIndex = get(player, `info.game_${value}_opp`)
        const opp = find(players.data, ['id', oppIndex])
        return {name: `${opp?.surname} ${opp?.name}`, id: oppIndex}
    }, [])

    let opponents = map([1, 2, 3, 4, 5], getOpponent)

    const handleClickVote = useCallback(async () => {
        await fetch(`${Constants.domain}/vote/?user_id=${player?.info?.id}&v_type=sport&plrs=${result}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .catch(error => console.error(error))
        player.info.sport_voted = true
        navigate('/')
    }, [result, navigate])

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

    const renderOpponent = (opponent) => <Button key={opponent.id} type={result.includes(opponent.id) ? 'primary' : 'secondary'} className={Styles.button} onClick={handleClickOpp(opponent.id)}>{opponent.name}</Button>

    return <div id='column' className='Chapter'>
        <p id={Styles.text}>Выберите игрока, с которыми у вас была самая приятная игра</p>
        {map(opponents, renderOpponent)}
        <Button className={Styles.sendButton} disabled={disabledSendButton} onClick={handleClickVote}>Проголосовать</Button>
    </div>
}

export default Vote
