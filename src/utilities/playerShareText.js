// Шеринг карточки игрока: подпись и подбор достижений для картинки. Чистые функции без React.

// Название турнира в подписи. Когда оно появится в meta, передавайте его вместо константы
export const TOURNAMENT_NAME = 'IceHammer 2026'

// Сколько достижений называем в подписи к картинке
export const SHARE_BADGES_LIMIT = 3

// Порядок для шеринга: сначала серьёзные (кроме «Армия проверена»: она есть почти у всех и ничем не выделяет),
// затем шуточные, в конце «Армия проверена». Внутри групп порядок из каталога достижений
export const sortBadgesForShare = (earned = []) => {
    const rank = (badge) => (badge.id === 'verified' ? 2 : badge.kind === 'main' ? 0 : 1)
    return [...earned].sort((a, b) => rank(a) - rank(b)) // сортировка стабильная, каталожный порядок сохраняется
}

export const pickShareBadges = (earned = [], limit = SHARE_BADGES_LIMIT) => sortBadgesForShare(earned).slice(0, limit)

// ---------- Плашки достижений на картинке ----------
// Только названия, без значков. Достижения занимают не больше двух строк, а то, что не поместилось, сворачивается в плашку «+N».
// Ширина строки: 360 (картинка) - 2*3 (рамка) - 2*16 (поля) = 322 px. Размеры взяты с запасом, чтобы текст не выходил за плашку.
export const SHARE_ROW_WIDTH = 322
export const SHARE_ROWS = 2
const CHIP_GAP = 6
const CHIP_FIXED = 22 // рамка и поля плашки
const CHAR_WIDTH = 6.4 // на каждую букву названия
export const EXTRA_CHIP_WIDTH = 46 // плашка «+N»

export const estimateChipWidth = (badge) => Math.ceil(CHIP_FIXED + String(badge.title).length * CHAR_WIDTH)

// Помещаются ли плашки заданной ширины в rows строк (перенос как у flex-wrap)
const fitsInRows = (widths, rows, rowWidth) => {
    let row = 1
    let used = 0
    for (const width of widths) {
        const need = used ? CHIP_GAP + width : width
        if (used + need <= rowWidth) {
            used += need
        } else if (row < rows) {
            row += 1
            used = width
        } else {
            return false
        }
    }
    return true
}

// Возвращает {shown, extra}: shown - достижения в порядке показа, extra - сколько не поместилось
export const layoutShareBadges = (earned = [], {rows = SHARE_ROWS, rowWidth = SHARE_ROW_WIDTH} = {}) => {
    const sorted = sortBadgesForShare(earned)
    const widths = sorted.map(estimateChipWidth)
    for (let count = sorted.length; count >= 1; count -= 1) {
        const test = widths.slice(0, count)
        if (count < sorted.length) test.push(EXTRA_CHIP_WIDTH)
        if (fitsInRows(test, rows, rowWidth)) {
            return {shown: sorted.slice(0, count), extra: sorted.length - count}
        }
    }
    return {shown: [], extra: sorted.length}
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
