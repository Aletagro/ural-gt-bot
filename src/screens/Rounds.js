import React, {useEffect, useReducer} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {rounds, players, meta} from '../utilities/appState'
import RoundPlay from '../components/RoundPlay'

import map from 'lodash/map'

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
    // eslint-disable-next-line
    }, [rounds?.selected])

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

    const renderPlay = (play, index) => <RoundPlay
        play={play}
        table={index}
        round={rounds.selected}
    />

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
