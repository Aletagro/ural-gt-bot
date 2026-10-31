import React, {useEffect, useReducer, useState} from 'react'
import {useLocation} from 'react-router-dom'

import Constants from '../Constants'
import {players, meta} from '../utilities/appState'
import {fetchMeta} from '../utilities/applyMeta'
import {useRoundTimer} from '../utilities/useRoundTimer'
import {getChampions, getArmyImage} from '../utilities/utils'
import {getMissionPool, isDrawNeeded, drawMission} from '../utilities/missionPool'
import MissionDraw from '../components/MissionDraw'

import map from 'lodash/map'

import Styles from './styles/Board.module.css'

const REFRESH_MS = 30 * 1000

const parseStat = (value) => {
    try {
        return JSON.parse(value) || {}
    } catch (e) {
        return {}
    }
}

const fetchRanking = () => fetch(`${Constants.domain}/players/ranking`)
    .then((response) => response.json())
    .then((data) => {
        players.standing = map(data.players, (item, index) => ({...item, place: index + 1}))
    })
    .catch((error) => console.error(error))

// Статус слева, когда таймера нет
const getIdleText = () => {
    if (meta.isFinished) return {title: 'Турнир завершён', subtitle: 'Спасибо всем за игру'}
    if (!meta.round) return {title: 'Скоро начало', subtitle: 'Турнир ещё не начался'}
    if (meta.isRoundActive) return {title: `Раунд ${meta.round}`, subtitle: 'Идёт игра'}
    return {title: `Раунд ${meta.round} завершён`, subtitle: 'Перерыв'}
}

const ArmyImage = ({allegiance, className}) => {
    const src = getArmyImage(allegiance)
    return src ? <img className={className} src={src} alt='' /> : <div className={className} />
}

const STATUS_CLASS = {warning: Styles.warning, critical: Styles.critical, over: Styles.over}

const Board = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const timer = useRoundTimer()
    // Кнопка жеребьёвки есть только на экране, открытом по ссылке с управлением (#/board?control=1): обычную ссылку видят все
    const isControl = new URLSearchParams(useLocation().search).has('control')
    const [draw, setDraw] = useState(null)

    // Данные обновляются сами: на экране никто ничего не нажимает
    useEffect(() => {
        const refresh = () => Promise.all([fetchMeta(), fetchRanking()]).then(() => forceUpdate())
        refresh()
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') refresh()
        }, REFRESH_MS)
        return () => clearInterval(id)
    }, [])

    // Не даём экрану уснуть
    useEffect(() => {
        let lock = null
        const request = async () => {
            try {
                if ('wakeLock' in navigator && document.visibilityState === 'visible') {
                    lock = await navigator.wakeLock.request('screen')
                }
            } catch (e) {
                // не везде поддерживается, это не критично
            }
        }
        request()
        document.addEventListener('visibilitychange', request)
        return () => {
            document.removeEventListener('visibilitychange', request)
            if (lock) lock.release().catch(() => {})
        }
    }, [])

    const {leader, byAlliance} = {...getChampions(players.standing)}
    const leaderStat = leader ? parseStat(leader.roster_stat) : {}
    const idle = getIdleText()
    const isRunning = timer.status !== 'off'

    const handleDraw = async () => {
        const pool = getMissionPool()
        if (!pool.length || draw) return
        setDraw({pool, title: null, round: meta.round})
        try {
            const result = await drawMission(pool)
            setDraw({pool, title: result.title, round: meta.round, poolSaved: result.poolSaved})
        } catch (error) {
            console.error(error)
            setDraw({pool, title: null, round: meta.round, error: 'Ответ сервера не получен. Попробуйте ещё раз'})
        }
    }

    const handleCloseDraw = () => {
        setDraw(null)
        fetchMeta().then(() => forceUpdate())
    }

    const renderMission = () => {
        if (draw) return null
        return <div className={Styles.missionBlock}>
            {meta.battleplan
                ? <>
                    <p className={Styles.missionLabel}>Миссия</p>
                    <p className={Styles.missionName}>{meta.battleplan}</p>
                </>
                : null
            }
            {isControl && isDrawNeeded()
                ? <button type='button' className={Styles.drawButton} onClick={handleDraw}>Определить миссию</button>
                : null
            }
        </div>
    }

    const renderTimer = () => <section className={`${Styles.timer} ${STATUS_CLASS[timer.status] || ''}`}>
        {isRunning
            ? <>
                <p className={Styles.timerLabel}>
                    {timer.status === 'over' ? `Раунд ${meta.round}` : `Раунд ${meta.round} · до конца`}
                </p>
                <p className={Styles.timerDigits}>{timer.status === 'over' ? 'Время вышло' : timer.text}</p>
                {timer.status === 'over' ? <p className={Styles.timerNote}>Дойграйте текущий ход</p> : null}
            </>
            : <>
                <p className={Styles.timerLabel}>{idle.subtitle}</p>
                <p className={Styles.idleTitle}>{idle.title}</p>
            </>
        }
        {renderMission()}
    </section>

    const renderLeader = () => <section className={Styles.leader}>
        <ArmyImage allegiance={leaderStat.allegiance} className={Styles.leaderImage} />
        <div className={Styles.leaderShade} />
        <p className={Styles.leaderLabel}>{meta.isFinished ? 'Чемпион турнира' : 'Лидер турнира'}</p>
        <div className={Styles.leaderBottom}>
            <p className={Styles.leaderName}>{leader.surname} {leader.name}</p>
            <p className={Styles.leaderArmy}>{leaderStat.allegiance} · {leader.tp_sum} ТО</p>
        </div>
    </section>

    const renderChampion = ({alliance, player}) => {
        const stat = player ? parseStat(player.roster_stat) : {}
        return <div
            key={alliance}
            className={Styles.champion}
            style={{'--accent': Constants.grandAlliances[alliance]?.color}}
        >
            {player ? <ArmyImage allegiance={stat.allegiance} className={Styles.championImage} /> : null}
            <div className={Styles.championShade} />
            <p className={Styles.alliance}>{alliance}</p>
            <div className={Styles.championBottom}>
                {player
                    ? <>
                        <p className={Styles.championName}>{player.surname} {player.name}</p>
                        <p className={Styles.championMeta}>{stat.allegiance} · {player.tp_sum}{Constants.noBreakSpace}ТО</p>
                    </>
                    : <p className={Styles.championMeta}>Пока никого</p>
                }
            </div>
        </div>
    }

    return <div className={Styles.board}>
        {draw ? <MissionDraw {...draw} onDone={handleCloseDraw} /> : null}
        <header className={Styles.top}>
            <span className={Styles.brand}>IceHammer 2026</span>
        </header>
        <main className={Styles.main}>
            {renderTimer()}
            <div className={Styles.right}>
                {leader
                    ? <>
                        {renderLeader()}
                        <div className={Styles.champions}>{map(byAlliance, renderChampion)}</div>
                    </>
                    : <p className={Styles.empty}>Лидеры появятся после первого раунда</p>
                }
            </div>
        </main>
    </div>
}

export default Board
