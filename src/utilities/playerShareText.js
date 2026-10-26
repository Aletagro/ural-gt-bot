// Шеринг карточки игрока: подпись и подбор достижений для картинки. Чистые функции без React.

// Название турнира в подписи. Когда оно появится в meta, передавайте его вместо константы
export const TOURNAMENT_NAME = 'IceHammer 2026'

// Сколько достижений помещается на картинку
export const SHARE_BADGES_LIMIT = 4

// Серьёзные впереди шуточных, внутри групп порядок из каталога достижений
export const pickShareBadges = (earned = [], limit = SHARE_BADGES_LIMIT) => {
    const main = earned.filter((badge) => badge.kind === 'main')
    const fun = earned.filter((badge) => badge.kind !== 'main')
    return [...main, ...fun].slice(0, limit)
}

// Заголовок места для картинки
export const getPlaceTitle = (place, isFinished) => {
    if (place === 1) return isFinished ? 'Чемпион турнира' : 'Лидер турнира'
    if (place) return `${place} место`
    return ''
}

// Подпись к картинке: кто, какое место, какой результат
export const buildShareText = (card, isFinished = false, tournamentName = TOURNAMENT_NAME) => {
    const {fullName, allegiance, place, total, tpSum, record, badges} = card
    const parts = [`${tournamentName}.`, `${fullName}`]
    if (allegiance) parts[1] += ` (${allegiance})`
    parts[1] += ':'

    if (place) {
        parts.push(`${place} место из ${total},`)
    }
    parts.push(`${tpSum} ТО (${record.wins}-${record.draws}-${record.losses}).`)

    const earned = badges?.earned || []
    if (earned.length) {
        const top = pickShareBadges(earned, 3).map((badge) => badge.title).join(', ')
        parts.push(`Достижения: ${top}${earned.length > 3 ? ` и ещё ${earned.length - 3}` : ''}.`)
    }
    return parts.join(' ')
}

// Имя файла картинки: латиница, без пробелов
export const buildShareFileName = (card) => `player-${card.id}.png`
