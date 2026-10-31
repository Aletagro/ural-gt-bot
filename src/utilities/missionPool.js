import Constants from '../Constants'
import {meta} from './appState'

// Бэк может хранить пул массивом или JSON-строкой. Если поля нет (null), считаем, что ни одна миссия ещё не разыграна
export const parsePool = (value) => {
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) ? parsed : null
        } catch (e) {
            return null
        }
    }
    return null
}

// Миссии, которые ещё не сыграны
export const getMissionPool = () => Array.isArray(meta.missionPool) ? meta.missionPool : [...Constants.tournamentMissionPool]

// Жеребьёвку можно запускать между турами: раунд не идёт, а миссия ещё не выбрана.
// Выбранная миссия сбрасывается, когда раунд заканчивается (см. clearMission), поэтому «не выбрана» значит «следующий тур без миссии»
export const isDrawNeeded = () => !meta.isFinished && !meta.isRoundActive && !meta.battleplan && getMissionPool().length > 0

const putMeta = async (body) => {
    const response = await fetch(`${Constants.domain}/tournament-meta/`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/javascript, /; q=0.01'
        }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

const getRandomIndex = (size) => {
    const values = new Uint32Array(1)
    window.crypto.getRandomValues(values)
    return values[0] % size
}

// Ставит миссию текущей и убирает её из пула. Если пул сохранить не удалось, возвращает poolSaved: false
export const saveMission = async (title) => {
    await putMeta({battleplan: title})
    meta.battleplan = title
    const pool = getMissionPool()
    if (!pool.includes(title)) return {poolSaved: true}
    const next = pool.filter((item) => item !== title)
    try {
        await putMeta({missionPool: next})
        meta.missionPool = next
        return {poolSaved: true}
    } catch (error) {
        console.error(error)
        return {poolSaved: false}
    }
}

// Снимает выбранную миссию. Вызывается при окончании тура, чтобы к следующему можно было определить новую
export const clearMission = async () => {
    await putMeta({battleplan: ''})
    meta.battleplan = ''
}

// Случайно выбирает миссию из переданного пула и сохраняет её
export const drawMission = async (pool) => {
    const title = pool[getRandomIndex(pool.length)]
    const result = await saveMission(title)
    return {title, ...result}
}

// Возвращает все миссии в пул
export const resetMissionPool = async () => {
    const pool = [...Constants.tournamentMissionPool]
    await putMeta({missionPool: pool})
    meta.missionPool = pool
}
