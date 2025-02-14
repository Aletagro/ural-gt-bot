import React, {useEffect, useReducer} from 'react'
import {useNavigate} from 'react-router-dom'
import {rounds, players} from '../utilities/appState'

import map from 'lodash/map'
import find from 'lodash/find'

import Styles from './styles/Rounds.module.css'

const Rounds = () => {
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const disablePrevButton = rounds.selected === 1
    const disableNextButton = rounds.selected === rounds.active

    useEffect(() => {
        // fetch(`https://aoscom.online/rounds/?round=${rounds.selected}`)
        //     .then(response => response.json())
        //     .then(data => {
        //         rounds[rounds.selected] = data
        //         forceUpdate()
        //     })
        //     .catch(error => console.error(error))

        fetch('https://aoscom.online/players/')
            .then(response => response.json())
            .then(data => {
                players.data = data
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

    const handleClickPlayer = (playerId) => () => {
        const player = find(players.data, ['id', playerId])
        if (player) {
            navigate('/playerInfo', {state: {player, title: `${player.surname} ${player.name}`}})
        }
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
        return <div key={index} id={Styles.row} style={{'background': `${index % 2 ? '#ECECEC' : ''}`}}>
            <p id={Styles.smallColumn}>{play.table}</p>
            <button id={Styles.сolumn} onClick={handleClickPlayer(play.playerOneId)}>
                <p>{play.playerOne}</p>
            </button>
            <p id={Styles.smallColumn}>{play.result || '0 - 0'}</p>
            <button id={Styles.сolumn} onClick={handleClickPlayer(play.playerTwoId)}>
                <p>{play.playerTwo}</p>
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