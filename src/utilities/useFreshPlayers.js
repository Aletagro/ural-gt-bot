import {useEffect, useState} from 'react'

import Constants from '../Constants'
import {players} from './appState'

/**
 * Один раз при открытии экрана запрашивает свежий список игроков.
 * status:
 *   'loading' - запрос идёт, пока показываем то, что есть в players.data
 *   'fresh'   - данные только что получены с сервера
 *   'stale'   - запрос не удался, остаётся players.data (может быть устаревшим)
 */
export const useFreshPlayers = () => {
    const [state, setState] = useState({status: 'loading', data: players?.data || []})

    useEffect(() => {
        let stopped = false

        fetch(`${Constants.domain}/players/`)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                return response.json()
            })
            .then((json) => {
                if (stopped) return
                const data = Array.isArray(json) ? json : json?.data
                if (!Array.isArray(data)) throw new Error('Неожиданный формат ответа /players/')
                setState({status: 'fresh', data})
            })
            .catch((error) => {
                console.error(error)
                if (!stopped) setState((prev) => ({...prev, status: 'stale'}))
            })

        return () => {
            stopped = true
        }
    }, [])

    return state
}
