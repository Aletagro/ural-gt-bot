// Чистая математика по играм турнира, без React.
// Основа для всех следующих блоков: buildGames -> getSides -> срезы.

// Количество раундов. Позже будет приходить из meta, тогда передавайте его вторым аргументом в buildGames
export const ROUNDS_COUNT = 5

// Система 20-0: в каждой игре делится 20 ТО, при ничьей 10-10
export const TP_PER_GAME = 20
export const DRAW_TP = 10

const safeParse = (value) => {
    if (!value) return null
    if (typeof value === 'object') return value
    try {
        return JSON.parse(value)
    } catch (e) {
        return null
    }
}

export const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null
    const number = Number(value)
    return Number.isNaN(number) ? null : number
}

const round1 = (n) => Math.round(n * 10) / 10
const average = (values) => (values.length ? round1(values.reduce((sum, v) => sum + v, 0) / values.length) : null)

// Победа: ТО > 10, ничья: = 10, поражение: < 10 (как в PlayerInfo)
export const getOutcome = (tp) => (tp > DRAW_TP ? 'win' : tp === DRAW_TP ? 'draw' : 'loss')

// Профиль игрока: ростер парсим один раз на игрока
export const buildProfile = (player) => {
    const roster = safeParse(player.roster)
    const stat = safeParse(player.roster_stat)
    return {
        player,
        id: player.id,
        fullName: `${player.surname} ${player.name}`,
        grandAlliance: roster?.grandAlliance || stat?.grandAlliance || '',
        allegiance: roster?.allegiance || stat?.allegiance || '',
        roster,
        stat: stat || {},
    }
}

const buildSide = (profile, round) => ({
    id: profile.id,
    fullName: profile.fullName,
    grandAlliance: profile.grandAlliance,
    allegiance: profile.allegiance,
    profile,
    tp: toNumber(profile.player[`game_${round}_tp`]),
    vp: toNumber(profile.player[`game_${round}_vp`]),
})

/**
 * Собирает игры из players.data. Игра хранится у обоих участников, поэтому берём её один раз на пару и раунд.
 * Возвращает:
 *   games  - завершённые игры (оба ТО есть): {round, table, a, b, isMirror}
 *   issues - что отбросили или что выглядит подозрительно (пригодится судьям)
 */
export const buildGames = (playersData = [], roundsCount = ROUNDS_COUNT) => {
    const profiles = new Map()
    playersData.forEach((p) => profiles.set(String(p.id), buildProfile(p)))

    const games = []
    const issues = {
        missingOpponent: 0, // соперника нет в players.data (например, удалён с турнира)
        oneSided: 0,        // результат есть только у одного из двух (так быть не должно)
        pending: 0,         // игра назначена, результата ещё нет
        tpSumMismatch: [],  // сумма ТО двух игроков не равна 20
    }

    for (let round = 1; round <= roundsCount; round++) {
        const seen = new Set()

        playersData.forEach((p) => {
            const oppId = p[`game_${round}_opp`]
            if (!oppId) return // 0 / null: в этом раунде соперника нет

            const key = [String(p.id), String(oppId)].sort().join('-')
            if (seen.has(key)) return
            seen.add(key)

            const profileA = profiles.get(String(p.id))
            const profileB = profiles.get(String(oppId))
            if (!profileB) {
                issues.missingOpponent += 1
                return
            }

            const a = buildSide(profileA, round)
            const b = buildSide(profileB, round)

            if (a.tp === null && b.tp === null) {
                issues.pending += 1
                return
            }
            if (a.tp === null || b.tp === null) {
                issues.oneSided += 1
                return
            }

            if (a.tp + b.tp !== TP_PER_GAME) {
                issues.tpSumMismatch.push({round, aId: a.id, bId: b.id})
            }

            games.push({
                round,
                table: toNumber(p[`game_${round}_table`]),
                a,
                b,
                // зеркало: одинаковая армия (пустые названия не считаем)
                isMirror: Boolean(a.allegiance) && a.allegiance === b.allegiance,
            })
        })
    }

    return {games, issues}
}

/**
 * Каждая игра глазами каждого из двух игроков. Основа для винрейта, средних ТО и VP.
 * [{round, table, player, opponent, outcome, tp, vp, oppVp, vpDiff, isMirror, isSameGrandAlliance}]
 */
export const getSides = (games) =>
    games.flatMap((game) =>
        [[game.a, game.b], [game.b, game.a]].map(([player, opponent]) => ({
            round: game.round,
            table: game.table,
            player,
            opponent,
            outcome: getOutcome(player.tp),
            tp: player.tp,
            vp: player.vp,
            oppVp: opponent.vp,
            vpDiff: player.vp !== null && opponent.vp !== null ? player.vp - opponent.vp : null,
            isMirror: game.isMirror,
            isSameGrandAlliance: Boolean(player.grandAlliance) && player.grandAlliance === opponent.grandAlliance,
        }))
    )

export const calcGamesSummary = (games) => {
    const sides = getSides(games)

    const rounds = [...new Set(games.map((g) => g.round))]
    const draws = games.filter((g) => getOutcome(g.a.tp) === 'draw').length

    const vpValues = sides.map((s) => s.vp).filter((v) => v !== null)
    const vpDiffs = games
        .filter((g) => g.a.vp !== null && g.b.vp !== null)
        .map((g) => Math.abs(g.a.vp - g.b.vp))

    return {
        gamesCount: games.length,
        roundsPlayed: rounds.length,
        lastRound: rounds.length ? Math.max(...rounds) : 0,
        playersCount: new Set(sides.map((s) => s.player.id)).size,
        draws,
        drawsPercent: games.length ? Math.round((draws / games.length) * 100) : 0,
        mirrors: games.filter((g) => g.isMirror).length,
        avgVp: average(vpValues),
        avgVpDiff: average(vpDiffs),
    }
}

// ---------------------------------------------------------------------------
// Шаг 2: Гранд Альянсы, армии, матрица Альянс против Альянса
// Все функции принимают sides (результат getSides), а не games
// ---------------------------------------------------------------------------

export const GRAND_ALLIANCES = ['Order', 'Chaos', 'Death', 'Destruction']

// Армии с меньшим числом игр показываем серыми и ниже остальных
export const MIN_GAMES_FOR_RATING = 3

// Винрейт: победа = 1, ничья и поражение = 0
const summarizeSides = (sides) => {
    const wins = sides.filter((s) => s.outcome === 'win').length
    const draws = sides.filter((s) => s.outcome === 'draw').length
    const losses = sides.filter((s) => s.outcome === 'loss').length
    return {
        games: sides.length,
        wins,
        draws,
        losses,
        winRate: sides.length ? Math.round((wins / sides.length) * 100) : null,
        avgTp: average(sides.map((s) => s.tp)),
        avgVp: average(sides.map((s) => s.vp).filter((v) => v !== null)),
    }
}

// Гранд Альянсы. Игры внутри одного Альянса не учитываем (там всегда 50 на 50),
// но считаем их число отдельно
export const calcGrandAllianceStats = (sides) =>
    GRAND_ALLIANCES.map((name) => {
        const own = sides.filter((s) => s.player.grandAlliance === name)
        const cross = own.filter((s) => !s.isSameGrandAlliance)
        return {
            name,
            ...summarizeSides(cross),
            internalGames: (own.length - cross.length) / 2, // каждая внутренняя игра даёт две стороны
        }
    })

// Армии. Зеркальные игры исключаем
export const calcArmyStats = (sides) => {
    const groups = new Map()
    sides
        .filter((s) => !s.isMirror && s.player.allegiance)
        .forEach((s) => {
            const key = s.player.allegiance
            if (!groups.has(key)) groups.set(key, {name: key, grandAlliance: s.player.grandAlliance, sides: []})
            groups.get(key).sides.push(s)
        })

    return [...groups.values()].map((group) => {
        const summary = summarizeSides(group.sides)
        return {
            name: group.name,
            grandAlliance: group.grandAlliance,
            ...summary,
            isSmall: summary.games < MIN_GAMES_FOR_RATING,
        }
    })
}

export const ARMY_SORT_KEYS = ['winRate', 'avgTp', 'avgVp', 'games']

const numOrLow = (value) => (value === null || value === undefined ? -1e9 : value)

// Сначала армии с достаточным числом игр, затем «малая выборка». Внутри групп сортировка по ключу
export const sortArmies = (armies, key = 'winRate') => {
    const compare = (a, b) =>
        numOrLow(b[key]) - numOrLow(a[key]) ||
        numOrLow(b.winRate) - numOrLow(a.winRate) ||
        b.games - a.games ||
        a.name.localeCompare(b.name)
    return [
        ...armies.filter((a) => !a.isSmall).sort(compare),
        ...armies.filter((a) => a.isSmall).sort(compare),
    ]
}

// Матрица: строка против колонки. cells[i][j] = игроки Альянса i против Альянса j.
// На диагонали только число игр внутри Альянса
export const calcMatchupMatrix = (sides) => ({
    alliances: GRAND_ALLIANCES,
    cells: GRAND_ALLIANCES.map((row) =>
        GRAND_ALLIANCES.map((col) => {
            const own = sides.filter((s) => s.player.grandAlliance === row && s.opponent.grandAlliance === col)
            return row === col
                ? {isDiagonal: true, games: own.length / 2}
                : {isDiagonal: false, ...summarizeSides(own)}
        })
    ),
})
// ---------------------------------------------------------------------------
// Шаг 3: раунды и срезы по ростерам (дропы, вунды, боевой строй, тактики)
// Везде одно правило: игры, где у обеих сторон одинаковое значение признака, в срез не попадают
// ---------------------------------------------------------------------------

// В сохранённом ростере тактики - строки, в билдере - объекты {name}. Поддерживаем оба варианта
const toTacticName = (tactic) => (typeof tactic === 'string' ? tactic : tactic?.name || '').trim()

// По раундам: сколько игр, средний VP, ничьи. Раунды без сыгранных игр пропускаем
export const calcRoundStats = (games, roundsCount = ROUNDS_COUNT) => {
    const rows = []
    for (let round = 1; round <= roundsCount; round++) {
        const roundGames = games.filter((g) => g.round === round)
        if (!roundGames.length) continue

        const vpValues = roundGames.flatMap((g) => [g.a.vp, g.b.vp]).filter((v) => v !== null)
        const vpDiffs = roundGames
            .filter((g) => g.a.vp !== null && g.b.vp !== null)
            .map((g) => Math.abs(g.a.vp - g.b.vp))
        const draws = roundGames.filter((g) => getOutcome(g.a.tp) === 'draw').length

        rows.push({
            round,
            games: roundGames.length,
            avgVp: average(vpValues),
            avgVpDiff: average(vpDiffs),
            draws,
            drawsPercent: Math.round((draws / roundGames.length) * 100),
        })
    }
    return rows
}

// Универсальный срез. describe(profile) возвращает {key, name, ...} или null, если признака нет.
// Игры, где у соперников одинаковый key, пропускаем
const buildSlice = (sides, describe) => {
    const groups = new Map()
    sides.forEach((side) => {
        const own = describe(side.player.profile)
        const opponent = describe(side.opponent.profile)
        if (!own || !opponent || own.key === opponent.key) return
        if (!groups.has(own.key)) groups.set(own.key, {info: own, sides: []})
        groups.get(own.key).sides.push(side)
    })
    return [...groups.values()].map(({info, sides: groupSides}) => {
        const summary = summarizeSides(groupSides)
        return {...info, ...summary, isSmall: summary.games < MIN_GAMES_FOR_RATING}
    })
}

const byOrder = (a, b) => a.order - b.order

const describeDrops = (profile) => {
    const drops = toNumber(profile.stat.drops)
    return drops === null ? null : {key: drops, name: String(drops), order: drops}
}

const describeFormation = (profile) => {
    const formation = String(profile.roster?.battleFormation || '').trim()
    if (!formation) return null
    return {key: `${profile.allegiance}|${formation}`, name: formation, army: profile.allegiance, order: 0}
}

// Вунды: три группы примерно равного размера по тем, кто играл. Границы считаем по значению,
// поэтому игроки с одинаковым числом вундов всегда попадают в одну группу
const buildWoundsDescriber = (sides) => {
    const profiles = new Map()
    sides.forEach((s) => profiles.set(s.player.id, s.player.profile))
    const values = [...profiles.values()]
        .map((p) => toNumber(p.stat.wounds))
        .filter((v) => v !== null && v > 0)
        .sort((a, b) => a - b)
    if (values.length < 3) return null

    const cut1 = values[Math.ceil(values.length / 3) - 1]
    const cut2 = values[Math.ceil((values.length * 2) / 3) - 1]
    const groupOf = (v) => (v <= cut1 ? 0 : v <= cut2 ? 1 : 2)

    const ranges = [[], [], []]
    values.forEach((v) => ranges[groupOf(v)].push(v))

    return (profile) => {
        const wounds = toNumber(profile.stat.wounds)
        if (wounds === null || wounds <= 0) return null
        const group = groupOf(wounds)
        const range = ranges[group]
        const min = range[0]
        const max = range[range.length - 1]
        return {key: group, name: min === max ? String(min) : `${min}–${max}`, order: group}
    }
}

// Тактики: каждая карточка отдельно. Игры, где карточку взяли оба, исключаем
export const calcTacticStats = (sides) => {
    const cache = new Map()
    const tacticsOf = (profile) => {
        if (!cache.has(profile)) {
            const list = Array.isArray(profile.roster?.tactics) ? profile.roster.tactics : []
            cache.set(profile, new Set(list.map(toTacticName).filter(Boolean)))
        }
        return cache.get(profile)
    }

    const groups = new Map()
    sides.forEach((side) => {
        const own = tacticsOf(side.player.profile)
        const opponent = tacticsOf(side.opponent.profile)
        own.forEach((name) => {
            if (opponent.has(name)) return
            if (!groups.has(name)) groups.set(name, [])
            groups.get(name).push(side)
        })
    })

    // сколько играющих игроков взяли карточку (без учёта исключённых игр)
    const profiles = new Map()
    sides.forEach((s) => profiles.set(s.player.id, s.player.profile))
    const ownersCount = new Map()
    profiles.forEach((profile) => tacticsOf(profile).forEach((name) => ownersCount.set(name, (ownersCount.get(name) || 0) + 1)))

    return [...groups].map(([name, groupSides]) => {
        const summary = summarizeSides(groupSides)
        return {name, players: ownersCount.get(name) || 0, ...summary, isSmall: summary.games < MIN_GAMES_FOR_RATING}
    })
}

export const calcRosterSlices = (sides) => {
    const describeWounds = buildWoundsDescriber(sides)
    return {
        drops: buildSlice(sides, describeDrops).sort(byOrder),
        wounds: describeWounds ? buildSlice(sides, describeWounds).sort(byOrder) : [],
        formations: sortArmies(buildSlice(sides, describeFormation)),
        tactics: sortArmies(calcTacticStats(sides)),
    }
}

// ---------------------------------------------------------------------------
// Шаг 4: интересные факты и блок для судей
// ---------------------------------------------------------------------------

const MAX_NAMES = 3

// Список имён для вывода: первые три и "и ещё N"
export const joinNames = (names) =>
    names.length > MAX_NAMES
        ? `${names.slice(0, MAX_NAMES).join(', ')} и ещё ${names.length - MAX_NAMES}`
        : names.join(', ')

// Факты для всех игроков
export const calcFacts = (games, sides) => {
    // 1. Самая длинная серия побед подряд. Пропущенный раунд серию прерывает
    const byPlayer = new Map()
    sides.forEach((s) => {
        if (!byPlayer.has(s.player.id)) byPlayer.set(s.player.id, {name: s.player.fullName, sides: []})
        byPlayer.get(s.player.id).sides.push(s)
    })
    const streaks = [...byPlayer.values()].map(({name, sides: playerSides}) => {
        let best = 0
        let current = 0
        let prevRound = null
        playerSides
            .slice()
            .sort((a, b) => a.round - b.round)
            .forEach((s) => {
                if (prevRound !== null && s.round !== prevRound + 1) current = 0
                current = s.outcome === 'win' ? current + 1 : 0
                best = Math.max(best, current)
                prevRound = s.round
            })
        return {name, length: best}
    })
    const longest = Math.max(0, ...streaks.map((s) => s.length))
    const winStreak = longest >= 2
        ? {length: longest, names: streaks.filter((s) => s.length === longest).map((s) => s.name)}
        : null

    // 2. Самая крупная победа по VP
    const withVp = games.filter((g) => g.a.vp !== null && g.b.vp !== null)
    const maxDiff = Math.max(0, ...withVp.map((g) => Math.abs(g.a.vp - g.b.vp)))
    const biggestWin = maxDiff > 0
        ? {
            diff: maxDiff,
            games: withVp
                .filter((g) => Math.abs(g.a.vp - g.b.vp) === maxDiff)
                .map((g) => {
                    const [winner, loser] = g.a.vp > g.b.vp ? [g.a, g.b] : [g.b, g.a]
                    return {round: g.round, winner: winner.fullName, loser: loser.fullName, winnerVp: winner.vp, loserVp: loser.vp}
                }),
        }
        : null

    // 3. Больше всего VP за одну игру
    const vpSides = sides.filter((s) => s.vp !== null)
    const maxVp = Math.max(0, ...vpSides.map((s) => s.vp))
    const topVp = maxVp > 0
        ? {
            vp: maxVp,
            items: vpSides
                .filter((s) => s.vp === maxVp)
                .map((s) => ({name: s.player.fullName, round: s.round, opponent: s.opponent.fullName, oppVp: s.oppVp})),
        }
        : null

    // 4. Самый сложный путь: наибольшая сумма ТО оппонентов (поле opp_p)
    const profiles = new Map()
    sides.forEach((s) => profiles.set(s.player.id, s.player.profile))
    const paths = [...profiles.values()]
        .map((p) => ({name: p.fullName, value: toNumber(p.player.opp_p)}))
        .filter((x) => x.value !== null && x.value > 0)
    const maxPath = Math.max(0, ...paths.map((x) => x.value))
    const hardestPath = maxPath > 0
        ? {value: maxPath, names: paths.filter((x) => x.value === maxPath).map((x) => x.name)}
        : null

    return {winStreak, biggestWin, topVp, hardestPath}
}

// Проверка данных для судей. Ожидаемый счёт по правилам 20-0:
//  - разница VP 0 и полная ничья: 10-10, при равных VP победа по тактикам: 11-9
//  - разница от 1 до 5 VP: 12-8, от 6 до 10: 13-7 и так далее, максимум 20-0
// Если на турнире другая система, отключите проверку соответствия счёта: CHECK_TP_BY_VP
export const CHECK_TP_BY_VP = true

const expectedWinnerTp = (vpDiff) => Math.min(TP_PER_GAME, DRAW_TP + 1 + Math.ceil(vpDiff / 5))

export const calcDataChecks = (games, issues) => {
    const items = []

    games.forEach((game) => {
        const {a, b, round, table} = game
        const base = {round, table, aName: a.fullName, bName: b.fullName}
        const score = `${a.tp}-${b.tp}`

        if (a.tp + b.tp !== TP_PER_GAME) {
            items.push({...base, kind: 'tpSum', text: `сумма ТО ${a.tp + b.tp} вместо ${TP_PER_GAME} (${score})`})
            return
        }
        if (a.vp === null || b.vp === null) {
            items.push({...base, kind: 'noVp', text: `нет VP, счёт ТО ${score}`})
            return
        }
        if (!CHECK_TP_BY_VP) return

        const diff = Math.abs(a.vp - b.vp)
        if (diff === 0) {
            if (![DRAW_TP - 1, DRAW_TP, DRAW_TP + 1].includes(a.tp)) {
                items.push({...base, kind: 'tpVsVp', text: `VP равны (${a.vp}-${b.vp}), а счёт ТО ${score}`})
            }
            return
        }
        const [winner, loser] = a.vp > b.vp ? [a, b] : [b, a]
        const expected = expectedWinnerTp(diff)
        if (winner.tp !== expected) {
            items.push({
                ...base,
                kind: 'tpVsVp',
                text: `VP ${a.vp}-${b.vp} (разница ${diff}), ожидалось ${expected}-${TP_PER_GAME - expected} в пользу ${winner.fullName}, введено ${winner.tp}-${loser.tp}`,
            })
        }
    })

    return {
        items: items.sort((x, y) => x.round - y.round),
        pending: issues.pending,
        oneSided: issues.oneSided,
        missingOpponent: issues.missingOpponent,
    }
}

// Голоса за покрас (my_paint) и спортивность (my_sport) по Гранд Альянсам. Считаем всех со сданным ростером
export const calcVotesByAlliance = (playersData = []) => {
    const profiles = playersData.map(buildProfile)
    return GRAND_ALLIANCES.map((name) => {
        const group = profiles.filter((p) => p.grandAlliance === name)
        const sum = (field) => group.reduce((total, p) => total + (toNumber(p.player[field]) || 0), 0)
        const paintTotal = sum('my_paint')
        const sportTotal = sum('my_sport')
        return {
            name,
            players: group.length,
            paintTotal,
            paintAvg: group.length ? round1(paintTotal / group.length) : null,
            sportTotal,
            sportAvg: group.length ? round1(sportTotal / group.length) : null,
        }
    })
}

// Лидеры по голосам. При равенстве выше тот, у кого лучше место (places: Map id -> место)
export const calcVoteLeaders = (playersData = [], field, places = new Map(), limit = 3) =>
    playersData
        .map(buildProfile)
        .map((p) => ({
            id: p.id,
            fullName: p.fullName,
            allegiance: p.allegiance,
            votes: toNumber(p.player[field]) || 0,
            place: places.get(p.id) ?? null,
        }))
        .filter((x) => x.votes > 0)
        .sort((x, y) =>
            y.votes - x.votes ||
            (x.place ?? Infinity) - (y.place ?? Infinity) ||
            x.fullName.localeCompare(y.fullName)
        )
        .slice(0, limit)

// Столы: сколько игр прошло за каждым и сколько VP там набирают. Стол 0 или пустой - не назначен
export const calcTableStats = (games) => {
    const groups = new Map()
    games
        .filter((g) => g.table)
        .forEach((g) => {
            if (!groups.has(g.table)) groups.set(g.table, [])
            groups.get(g.table).push(g)
        })
    return [...groups]
        .map(([table, tableGames]) => {
            const vpValues = tableGames.flatMap((g) => [g.a.vp, g.b.vp]).filter((v) => v !== null)
            const vpDiffs = tableGames
                .filter((g) => g.a.vp !== null && g.b.vp !== null)
                .map((g) => Math.abs(g.a.vp - g.b.vp))
            return {table, games: tableGames.length, avgVp: average(vpValues), avgVpDiff: average(vpDiffs)}
        })
        .sort((x, y) => x.table - y.table)
}