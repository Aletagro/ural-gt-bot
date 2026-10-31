import React, {useState, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import FloatingLabelInput from './FloatingLabelInput'
import {rounds, player, players} from '../utilities/appState'
import Constants from '../Constants'

import get from 'lodash/get'
import find from 'lodash/find'

import Styles from './styles/RoundPlay.module.css'
import Button from './Button'

const inputStyle = {
    'width': '100%',
    'marginBottom': '16px',
}

const RoundPlay = ({play, table, round, onResultChange, preview}) => {
    const [isChangeResultBlockShow, setIsChangeResultBlockShow] = useState(false)
    const navigate = useNavigate()
    const playerOne = find(players.data, ['id', play[0]])
    const playerTwo = find(players.data, ['id', play[1]])
    const firstPlayerScore = get(playerOne, `game_${rounds.selected}_tp`) || 0
    const secondPlayerScore = get(playerTwo, `game_${rounds.selected}_tp`) || 0
    const [firstValue, setFirstValue] = useState(0)
    const [secondValue, setSecondValue] = useState(0)
    const [minorWin, setMinorWin] = useState(null)

    const handleClickPlayer = (_player) => () => {
        if (preview) return
        navigate('/playerInfo', {state: {player: _player, title: `${_player?.surname} ${_player?.name}`}})
    }

    // только цифры и без ведущих нулей: «010» превращается в «10»
    const normalizeVp = (value) => value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')

    const handleChangeFirstValue = (e) => {
        setFirstValue(normalizeVp(e.target.value))
    }

    const handleChangeSecondValue = (e) => {
        setSecondValue(normalizeVp(e.target.value))
    }

    const handleChangeResult = useCallback(async () => {
        if (preview) {
            // тест: считаем очки турнира по введённому счёту, чтобы карточка показала итог
            const diff = Number(firstValue) - Number(secondValue)
            const [tpOne, tpTwo] = diff > 0 ? [15, 5] : diff < 0 ? [5, 15] : [10, 10]
            playerOne[`game_${round}_tp`] = tpOne
            playerTwo[`game_${round}_tp`] = tpTwo
            setIsChangeResultBlockShow(false)
            if (onResultChange) onResultChange(true)
            return
        }
        try {
            const response = await fetch(`${Constants.domain}/rounds/play/?cur_round=${round}&cur_table=${table}&vp_first=${firstValue}&vp_second=${secondValue}&minor_win=${minorWin || 0}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json, text/javascript, /; q=0.01"
                }
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            setIsChangeResultBlockShow(false)
            if (onResultChange) onResultChange(true)
        } catch (error) {
            console.error(error)
            if (onResultChange) onResultChange(false)
        }
    }, [round, table, firstValue, secondValue, minorWin, onResultChange, preview, playerOne, playerTwo])

    const handleClickCheckbox = (value) => () => {
        setMinorWin(value)
    }

    const renderTiebreakOption = ({value, label}) => <button
        key={value}
        type='button'
        className={`${Styles.option} ${minorWin === value ? Styles.optionSelected : ''}`}
        onClick={handleClickCheckbox(value)}
    >
        <span className={Styles.radio} />
        {label}
    </button>

    const renderChangeResultBlock = () => {
        const tiebreakOptions = [
            {value: 1, label: playerOne?.surname},
            {value: 0, label: 'Равное количество'},
            {value: 2, label: playerTwo?.surname}
        ]
        return <div className={Styles.change}>
            <p className={Styles.changeTitle}>Изменить результат</p>
            <div className={Styles.inputs}>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeFirstValue}
                    inputMode='numeric'
                    label={playerOne.surname}
                    value={firstValue}
                />
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeSecondValue}
                    inputMode='numeric'
                    label={playerTwo.surname}
                    value={secondValue}
                />
            </div>
            {firstValue && firstValue === secondValue
                ? <div>
                    <p className={Styles.tiebreakTitle}>Кто выполнил больше тактик</p>
                    {tiebreakOptions.map(renderTiebreakOption)}
                </div>
                : null
            }
            <Button className={Styles.changeButton} onClick={handleChangeResult}>Изменить результаты</Button>
        </div>
    }

    const handelShowChangeResultBlock = () => {
        if (player.isJudge) {
            setIsChangeResultBlockShow(!isChangeResultBlockShow)
        }
    }

    // список игроков может ещё загружаться, не падаем на пустом значении
    if (!playerOne || !playerTwo) return null

    const isJudge = Boolean(player.isJudge)
    const isFirstWin = firstPlayerScore > secondPlayerScore
    const isSecondWin = secondPlayerScore > firstPlayerScore
    const ScoreTag = isJudge ? 'button' : 'div'

    return <div className={`${Styles.card} ${isChangeResultBlockShow ? Styles.cardOpen : ''}`}>
        <div className={Styles.row}>
            <span className={Styles.table}>{table}</span>
            <button type='button' className={`${Styles.player} ${isSecondWin ? Styles.loser : ''}`} onClick={handleClickPlayer(playerOne)}>
                <span className={Styles.surname}>{playerOne.surname}</span>
                <span className={Styles.name}>{playerOne.name}</span>
            </button>
            <ScoreTag
                {...(isJudge ? {type: 'button', onClick: handelShowChangeResultBlock} : {})}
                className={`${Styles.score} ${isJudge ? Styles.scoreEditable : ''}`}
            >
                <span className={isFirstWin ? Styles.scoreWin : ''}>{firstPlayerScore}</span>
                <span className={Styles.scoreDash}>:</span>
                <span className={isSecondWin ? Styles.scoreWin : ''}>{secondPlayerScore}</span>
            </ScoreTag>
            <button type='button' className={`${Styles.player} ${Styles.playerRight} ${isFirstWin ? Styles.loser : ''}`} onClick={handleClickPlayer(playerTwo)}>
                <span className={Styles.surname}>{playerTwo.surname}</span>
                <span className={Styles.name}>{playerTwo.name}</span>
            </button>
        </div>
        {isChangeResultBlockShow
            ? renderChangeResultBlock()
            : null
        }
    </div>
}


export default RoundPlay