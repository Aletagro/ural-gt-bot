import React, {useEffect, useReducer} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {rounds, players, meta} from '../utilities/appState'

import map from 'lodash/map'
import find from 'lodash/find'
import get from 'lodash/get'

import Styles from './styles/Rounds.module.css'

const Rounds = () => {
    const navigate = useNavigate()
    const state = useLocation()?.state
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const disablePrevButton = rounds.selected === 1
    const disableNextButton = rounds.selected === meta.round
    if (state?.round) {
        rounds.selected = state.round
    }

    useEffect(() => {
        if (!rounds[rounds.selected]) {
            fetch(`https://aoscom.online/rounds/?cur_round=${rounds.selected}`)
                .then(response => response.json())
                .then(data => {
                    rounds[rounds.selected] = data
                    forceUpdate()
                })
                .catch(error => console.error(error))
        }
        if (!players.data.length) {
            fetch('https://aoscom.online/players/')
                .then(response => response.json())
                .then(data => {
                    players.data = data
                    forceUpdate()
                })
                .catch(error => console.error(error))
        }
    }, [])

    const handleClickPlayer = (player) => () => {
        navigate('/playerInfo', {state: {player, title: `${player?.surname} ${player?.name}`}})
    }

    const handleClickPrevRound = () => {
        navigate('/rounds')
        rounds.selected = rounds.selected - 1
        rounds.stuckCount = rounds.stuckCount + 1
    }

    const handleClickNextRound = () => {
        navigate('/rounds')
        rounds.selected = rounds.selected + 1
        rounds.stuckCount = rounds.stuckCount + 1
    }

    const renderPlay = (play, index) => {
        const playerOne = find(players.data, ['id', play[0]])
        const playerTwo = find(players.data, ['id', play[1]])
        return <div key={index} id={Styles.row} style={{'background': `${index % 2 ? '#ECECEC' : ''}`}}>
            <p id={Styles.smallColumn}>{index}</p>
            <button id={Styles.сolumn} onClick={handleClickPlayer(playerOne)}>
                <p>{`${playerOne.surname} ${playerOne.name}`}</p>
            </button>
            <p id={Styles.smallColumn}>
                {get(playerOne, `game_${rounds.selected}_tp`) || 0} - {get(playerTwo, `game_${rounds.selected}_tp`) || 0}
            </p>
            <button id={Styles.сolumn} onClick={handleClickPlayer(playerTwo)}>
                <p>{`${playerTwo.surname} ${playerTwo.name}`}</p>
            </button>
        </div>
    }

    return <div id='column' className='Chapter'>
        <div id={Styles.buttonContainer}>
            <button disabled={disablePrevButton} onClick={handleClickPrevRound} id={disablePrevButton ? Styles.disableNextButton : Styles.nextButton}>
                Предыдущий
            </button>
            <b>Раунд {rounds.selected}</b>
            <button disabled={disableNextButton} onClick={handleClickNextRound} id={disableNextButton ? Styles.disableNextButton : Styles.nextButton}>
                Следующий
            </button>
        </div>
        <div>
            <div id={Styles.row} style={{'background': '#ECECEC'}}>
                <p id={Styles.smallColumn}>Стол</p>
                <p id={Styles.сolumn}>Игрок 1</p>
                <p id={Styles.smallColumn}>Результат</p>
                <p id={Styles.сolumn}>Игрок 2</p>
            </div>
            {map(rounds[rounds.selected], renderPlay)}
        </div>
    </div>
}

export default Rounds