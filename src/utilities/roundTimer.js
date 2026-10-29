// Таймер раунда. Чистые функции без React.
// В meta приходят два поля (оба в миллисекундах UTC):
//   roundEndsAt - когда заканчивается раунд (null, если таймер не запущен)
//   serverTime  - время сервера в момент ответа, по нему считается сдвиг часов телефона
// Обратный отсчёт всегда идёт от времени сервера, поэтому часовой пояс и неточные часы у игрока ни на что не влияют.

export const ROUND_DURATION_MIN = 180 // длина раунда по умолчанию при запуске таймера, минуты
export const ADJUST_STEP_MIN = 5 // шаг кнопок «+/- минуты» у судьи
export const WARNING_MIN = 30 // за сколько минут таймер становится жёлтым
export const CRITICAL_MIN = 15 // за сколько минут таймер становится красным

const MINUTE = 60 * 1000

// Приводит значение из meta к миллисекундам. Понимает миллисекунды, секунды и ISO-строку
export const toMs = (value) => {
    if (value === null || value === undefined || value === '') return null
    let ms
    if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value))) {
        ms = Number(value)
        if (ms < 1e11) ms *= 1000 // пришли секунды
    } else {
        ms = Date.parse(value)
    }
    return Number.isFinite(ms) && ms > 0 ? ms : null
}

// Насколько часы сервера впереди часов телефона. Берём середину между отправкой запроса и получением ответа
export const getClockOffset = (serverTime, sentAt, receivedAt) => {
    const server = toMs(serverTime)
    if (server === null) return 0
    return server - (sentAt + receivedAt) / 2
}

export const getServerNow = (offset = 0, now = Date.now()) => now + offset

// 1:05:09 для часа и больше, 05:09 для меньшего времени
export const formatLeft = (leftMs) => {
    const totalSeconds = Math.max(0, Math.ceil(leftMs / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const mm = String(minutes).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')
    return hours ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

// Состояние таймера: off (нет таймера), running, warning, critical, over
export const getTimerState = ({endsAt, offset = 0, now = Date.now(), isRoundActive = true}) => {
    const end = toMs(endsAt)
    if (!isRoundActive || end === null) {
        return {status: 'off', leftMs: 0, text: '', alert: null}
    }
    const leftMs = end - getServerNow(offset, now)
    if (leftMs <= 0) {
        return {status: 'over', leftMs: 0, overByMs: -leftMs, text: '00:00', alert: 'over'}
    }
    if (leftMs <= CRITICAL_MIN * MINUTE) {
        return {status: 'critical', leftMs, text: formatLeft(leftMs), alert: 'critical'}
    }
    if (leftMs <= WARNING_MIN * MINUTE) {
        return {status: 'warning', leftMs, text: formatLeft(leftMs), alert: 'warning'}
    }
    return {status: 'running', leftMs, text: formatLeft(leftMs), alert: null}
}

// Новое время окончания, когда судья добавляет или убирает минуты. Часы устройства не нужны: сдвигаем само время окончания
export const getShiftedEndsAt = (endsAt, deltaMin) => {
    const end = toMs(endsAt)
    return end === null ? null : end + deltaMin * MINUTE
}

// Время окончания для нового таймера: сейчас по серверу + длина раунда
export const getNewEndsAt = (offset = 0, durationMin = ROUND_DURATION_MIN, now = Date.now()) =>
    Math.round(getServerNow(offset, now) + durationMin * MINUTE)
