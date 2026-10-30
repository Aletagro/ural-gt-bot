import React, {useCallback, useEffect, useReducer} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {rounds, players, meta} from '../utilities/appState'
import RoundPlay from '../components/RoundPlay'
import Constants from '../Constants'

import map from 'lodash/map'
import size from 'lodash/size'

import Styles from './styles/Rounds.module.css'
import Button from '../components/Button'

const MIN_REFRESH_GAP_MS = 30 * 1000 // не чаще одного обновления в 30 секунд при возврате в приложение
let lastRefreshAt = 0

const getJson = async (url) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
}

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

    const loadPlayers = useCallback(async () => {
        try {
            const json = await getJson(`${Constants.domain}/players/`)
            const data = Array.isArray(json) ? json : json?.data
            if (Array.isArray(data)) {
                players.data = data
                forceUpdate()
            }
        } catch (error) {
            console.error(error)
        }
    }, [])

    // Паринги закончившихся раундов не меняются, их берём из памяти. Паринги текущего раунда запрашиваем заново
    const loadRound = useCallback(async () => {
        const selected = rounds.selected
        if (rounds[selected] && selected < meta.round) return
        try {
            rounds[selected] = await getJson(`${Constants.domain}/rounds/?cur_round=${selected}`)
            forceUpdate()
        } catch (error) {
            console.error(error)
        }
    }, [])

    useEffect(() => {
        loadRound()
    // eslint-disable-next-line
    }, [rounds.selected])

    useEffect(() => {
        lastRefreshAt = Date.now()
        loadPlayers()
        const refresh = () => {
            if (document.visibilityState !== 'visible') return
            if (Date.now() - lastRefreshAt < MIN_REFRESH_GAP_MS) return
            lastRefreshAt = Date.now()
            loadPlayers()
            loadRound()
        }
        document.addEventListener('visibilitychange', refresh)
        return () => document.removeEventListener('visibilitychange', refresh)
    }, [loadPlayers, loadRound])

    // Судья изменил результат: показываем итог и обновляем таблицу
    const handleResultChange = useCallback((isSuccess) => {
        if (isSuccess) {
            toast.success('Результат изменён', Constants.toastParams)
            loadPlayers()
        } else {
            toast.error('Не удалось изменить результат', Constants.toastParams)
        }
    }, [loadPlayers])

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
        onResultChange={handleResultChange}
    />

    return <div id='column' className='Chapter'>
        <div id={Styles.buttonContainer}>
            <Button className={Styles.nextButton} disabled={disablePrevButton} onClick={handleClickPrevRound}>
                Предыдущий
            </Button>
            <b>Раунд {rounds.selected}</b>
            <Button className={Styles.nextButton} disabled={disableNextButton} onClick={handleClickNextRound}>
                Следующий
            </Button>
        </div>
        <div>
            <div id={Styles.row} style={{'background': '#ECECEC'}}>
                <p id={Styles.smallColumn}>Стол</p>
                <p id={Styles.сolumn}>Игрок 1</p>
                <p id={Styles.smallColumn}>Результат</p>
                <p id={Styles.сolumn}>Игрок 2</p>
            </div>
            {size(players.data) ? map(rounds[rounds.selected], renderPlay) : null}
        </div>
        <ToastContainer />
    </div>
}

export default Rounds
