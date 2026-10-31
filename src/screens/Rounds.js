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

const Rounds = ({preview = false}) => {
    const navigate = useNavigate()
    const state = useLocation()?.state
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    if (state?.round) {
        rounds.selected = state.round
    }
    const maxRound = Math.max(meta.round || 0, 1)
    rounds.selected = Math.min(Math.max(rounds.selected, 1), maxRound)
    const disablePrevButton = rounds.selected <= 1
    const disableNextButton = rounds.selected >= maxRound

    const loadPlayers = useCallback(async () => {
        if (preview) return
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
    }, [preview])

    const loadRound = useCallback(async () => {
        if (preview) return
        const selected = rounds.selected
        if (rounds[selected] && selected < meta.round) return
        try {
            rounds[selected] = await getJson(`${Constants.domain}/rounds/?cur_round=${selected}`)
            forceUpdate()
        } catch (error) {
            console.error(error)
        }
    }, [preview])

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
        if (preview) forceUpdate()
        else navigate('/rounds')
        rounds.selected = Math.max(rounds.selected - 1, 1)
        rounds.stuckCount = rounds.stuckCount + 1
    }

    const handleClickNextRound = () => {
        if (preview) forceUpdate()
        else navigate('/rounds')
        rounds.selected = Math.min(rounds.selected + 1, maxRound)
        rounds.stuckCount = rounds.stuckCount + 1
    }

    const renderPlay = (play, index) => <RoundPlay
        key={`${rounds.selected}-${index}`}
        preview={preview}
        play={play}
        table={index}
        round={rounds.selected}
        onResultChange={handleResultChange}
    />

    return <div id='column' className='Chapter'>
        <div className={Styles.switcher}>
            <Button className={Styles.nextButton} disabled={disablePrevButton} onClick={handleClickPrevRound} type='secondary' size='sm'>
                Предыдущий
            </Button>
            <span className={Styles.roundTitle}>Раунд {rounds.selected}</span>
            <Button className={Styles.nextButton} disabled={disableNextButton} onClick={handleClickNextRound} type='secondary' size='sm'>
                Следующий
            </Button>
        </div>
        <div className={Styles.head}>
            <span className={Styles.headTable}>№</span>
            <span>Игрок 1</span>
            <span className={Styles.headCenter}>Счёт</span>
            <span className={Styles.headRight}>Игрок 2</span>
        </div>
        <div>
            {size(players.data) ? map(rounds[rounds.selected], renderPlay) : null}
        </div>
        <ToastContainer />
    </div>
}

export default Rounds
