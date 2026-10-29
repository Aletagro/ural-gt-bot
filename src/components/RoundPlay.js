import React, {useState, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import FloatingLabelInput from './FloatingLabelInput'
import Checkbox from './Checkbox'
import {rounds, player, players} from '../utilities/appState'
import Constants from '../Constants'

import get from 'lodash/get'
import find from 'lodash/find'

import Styles from './styles/RoundPlay.module.css'

const inputStyle = {
    '--Input-minHeight': '48px',
    'width': '100%',
    'borderRadius': '4px',
    'marginBottom': '16px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}

const RoundPlay = ({play, table, round, onResultChange}) => {
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
        navigate('/playerInfo', {state: {player: _player, title: `${_player?.surname} ${_player?.name}`}})
    }

    const handleChangeFirstValue = (e) => {
        setFirstValue(e.target.value)
    }

    const handleChangeSecondValue = (e) => {
        setSecondValue(e.target.value)
    }

    const handleChangeResult = useCallback(async () => {
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
    }, [round, table, firstValue, secondValue, minorWin, onResultChange])

    const handleClickCheckbox = (value) => () => {
        setMinorWin(value)
    }

    const renderChangeResultBlock = () => {
        return <div id={Styles.changeContainer}>
            <FloatingLabelInput
                style={inputStyle}
                onChange={handleChangeFirstValue}
                label={playerOne.surname}
                value={firstValue}
            />
            <FloatingLabelInput
                style={inputStyle}
                onChange={handleChangeSecondValue}
                label={playerTwo.surname}
                value={secondValue}
            />
            {firstValue && firstValue === secondValue
                ? <div>
                    <p id={Styles.checkboxTitle}>Кто выполнил больше тактик</p>
                    <div>
                        <div id={Styles.checkboxRow} onClick={handleClickCheckbox(1)}>
                            <Checkbox onClick={handleClickCheckbox(1)} checked={minorWin === 1} />
                            <p id={Styles.checkboxText}>{playerOne?.surname}</p>
                        </div>
                        <div id={Styles.checkboxRow} onClick={handleClickCheckbox(0)}>
                            <Checkbox onClick={handleClickCheckbox(0)} checked={minorWin === 0} />
                            <p id={Styles.checkboxText}>Равное количество</p>
                        </div>
                        <div id={Styles.checkboxRow} onClick={handleClickCheckbox(2)}>
                            <Checkbox onClick={handleClickCheckbox(2)} checked={minorWin === 2} />
                            <p id={Styles.checkboxText}>{playerTwo?.surname}</p>
                        </div>
                    </div>
                </div>
                : null
            }
            <button id={Styles.changeButton} onClick={handleChangeResult}>Изменить результаты</button>
        </div>
    }

    const handelShowChangeResultBlock = () => {
        if (player.isJudge) {
            setIsChangeResultBlockShow(!isChangeResultBlockShow)
        }
    }

    // список игроков может ещё загружаться, не падаем на пустом значении
    if (!playerOne || !playerTwo) return null

    return <div style={{'background': `${table % 2 ? '' : '#ECECEC'}`}}>
        <div key={table} id={Styles.row}>
            <p id={Styles.smallColumn}>{table}</p>
            <button id={Styles.сolumn} onClick={handleClickPlayer(playerOne)}>
                <p>{`${playerOne.surname} ${playerOne.name}`}</p>
            </button>
            <p id={Styles.smallColumn} onClick={handelShowChangeResultBlock}>
                {firstPlayerScore} - {secondPlayerScore}
            </p>
            <button id={Styles.сolumn} onClick={handleClickPlayer(playerTwo)}>
                <p>{`${playerTwo.surname} ${playerTwo.name}`}</p>
            </button>
        </div>
        {isChangeResultBlockShow
            ? renderChangeResultBlock()
            : null
        }
    </div>
}


export default RoundPlay