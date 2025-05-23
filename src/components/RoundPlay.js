import React, {useState, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import FloatingLabelInput from './FloatingLabelInput'
import {rounds, player, players} from '../utilities/appState'

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

const RoundPlay = ({play, table, round, onOpenModal, onCloseModal}) => {
    const [isChangeResultBlockShow, setIsChangeResultBlockShow] = useState(false)
    const navigate = useNavigate()
    const playerOne = find(players.data, ['id', play[0]])
    const playerTwo = find(players.data, ['id', play[1]])
    const [firstValue, setFirstValue] = useState(get(playerOne, `game_${rounds.selected}_tp`) || 0)
    const [secondValue, setSecondValue] = useState(get(playerTwo, `game_${rounds.selected}_tp`) || 0)

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
        setIsChangeResultBlockShow(false)
        await fetch(`https://aoscom.online/rounds/play/?cur_round=${round}&cur_table=${table}&vp_first=${firstValue}&vp_second=${secondValue}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .catch(error => console.error(error))
    }, [round, table, firstValue, secondValue])

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
            <button id={Styles.changeButton} onClick={handleChangeResult}>Изменить результаты</button>
        </div>
    }

    const handelShowChangeResultBlock = () => {
        if (player.isJudge) {
            setIsChangeResultBlockShow(!isChangeResultBlockShow)
        }
    }

    return <div style={{'background': `${table % 2 ? '' : '#ECECEC'}`}}>
        <div key={table} id={Styles.row}>
            <p id={Styles.smallColumn}>{table}</p>
            <button id={Styles.сolumn} onClick={handleClickPlayer(playerOne)}>
                <p>{`${playerOne.surname} ${playerOne.name}`}</p>
            </button>
            <p id={Styles.smallColumn} onClick={handelShowChangeResultBlock}>
                {firstValue} - {secondValue}
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