import Constants from '../Constants'
import {meta} from './appState'
import {toMs, getClockOffset} from './roundTimer'

// Переносит ответ /tournament-meta/ в общий объект meta. sentAt нужен, чтобы посчитать сдвиг часов относительно сервера
export const applyMeta = (data, sentAt = Date.now()) => {
    const receivedAt = Date.now()
    meta.round = data.round
    meta.isRoundActive = data.isRoundActive
    meta.rostersBeingAccepted = data.rostersBeingAccepted
    meta.isRostersShow = data.isRostersShow
    meta.isTournamentRulesShow = data.isTournamentRulesShow
    meta.isPlayersListShow = data.isPlayersListShow
    meta.isChallengesOpen = data.isChallengesOpen
    meta.isRegOpen = data.isRegOpen
    meta.battleplan = data.battleplan
    meta.playersLimit = data.playersLimit
    meta.isFinished = data.isFinished
    meta.roundEndsAt = toMs(data.roundEndsAt)
    if (data.serverTime !== undefined) {
        meta.clockOffset = getClockOffset(data.serverTime, sentAt, receivedAt)
    }
    // if (process.env.NODE_ENV !== 'production') applyTestTimer()
}

// Загружает свежую meta. Возвращает промис с признаком успеха
export const fetchMeta = () => {
    const sentAt = Date.now()
    return fetch(`${Constants.domain}/tournament-meta/`)
        .then((response) => response.json())
        .then((data) => {
            applyMeta(data, sentAt)
            return true
        })
        .catch((error) => {
            console.error(error)
            return false
        })
}

// ---------- Только для разработки: тест таймера без бэкенда ----------
// В боевую сборку (npm run build / deploy) этот блок не попадает.
// В консоли браузера (npm start): setTestTimer(120) - раунд закончится через 120 секунд, clearTestTimer() - убрать
const TEST_KEY = 'testTimerEndsAt'

const applyTestTimer = () => {
    try {
        const endsAt = Number(localStorage.getItem(TEST_KEY))
        if (!endsAt) return
        meta.isRoundActive = 1
        meta.round = meta.round || 1
        meta.roundEndsAt = endsAt
        meta.clockOffset = 0
    } catch (e) {
        // localStorage может быть недоступен
    }
}

if (process.env.NODE_ENV !== 'production') {
    window.setTestTimer = (seconds) => {
        localStorage.setItem(TEST_KEY, String(Date.now() + seconds * 1000))
        applyTestTimer()
        return `Таймер раунда поставлен на ${seconds} с`
    }
    window.clearTestTimer = () => {
        localStorage.removeItem(TEST_KEY)
        return 'Тестовый таймер убран, обновите страницу'
    }
}
