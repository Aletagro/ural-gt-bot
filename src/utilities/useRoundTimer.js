import {useEffect, useState} from 'react'

import {meta} from './appState'
import {fetchMeta} from './applyMeta'
import {getTimerState} from './roundTimer'

const MIN_REFRESH_GAP_MS = 60 * 1000 // не чаще одного обновления meta в минуту

const HAPTIC_TYPE = {warning: 'warning', critical: 'warning', over: 'error'}

// Вибрация в Telegram, когда таймер переходит на следующий порог. Хук может жить на нескольких экранах,
// поэтому память о последнем пороге общая, и вибрация срабатывает один раз
const lastSeen = {endsAt: null, alert: undefined}
const buzzOnAlertChange = (endsAt, alert) => {
    if (lastSeen.endsAt !== endsAt) {
        lastSeen.endsAt = endsAt
        lastSeen.alert = alert // при открытии приложения не вибрируем за уже пройденный порог
        return
    }
    if (lastSeen.alert === alert) return
    lastSeen.alert = alert
    if (alert) {
        try {
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(HAPTIC_TYPE[alert])
        } catch (e) {
            // вибрация не критична
        }
    }
}

let lastRefreshAt = 0 // общие для всех экранов, чтобы запросы не дублировались
let checkedEndsAt = null

// Состояние таймера раунда, пересчитывается каждую секунду. Время берём из общего объекта meta
export const useRoundTimer = () => {
    const [, setTick] = useState(0)

    useEffect(() => {
        const id = setInterval(() => setTick((value) => value + 1), 1000)
        return () => clearInterval(id)
    }, [])

    const isRoundActive = Boolean(meta.isRoundActive)

    useEffect(() => {
        if (!isRoundActive) return undefined
        const refresh = () => {
            if (document.visibilityState !== 'visible') return
            if (Date.now() - lastRefreshAt < MIN_REFRESH_GAP_MS) return
            lastRefreshAt = Date.now()
            fetchMeta()
        }
        document.addEventListener('visibilitychange', refresh)
        return () => document.removeEventListener('visibilitychange', refresh)
    }, [isRoundActive])

    const state = getTimerState({endsAt: meta.roundEndsAt, offset: meta.clockOffset, isRoundActive})

    useEffect(() => {
        if (state.status !== 'off') buzzOnAlertChange(meta.roundEndsAt, state.alert)
    })

    // Один запрос, когда время вышло: вдруг судья продлил раунд
    const isOver = state.status === 'over'
    useEffect(() => {
        if (!isOver || checkedEndsAt === meta.roundEndsAt) return
        checkedEndsAt = meta.roundEndsAt
        fetchMeta()
    }, [isOver])

    return state
}
