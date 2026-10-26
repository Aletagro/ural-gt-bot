// Карточка игрока: результаты, игры по раундам и значки. Чистая математика без React.
// Основа: buildGames / getSides из gamesCalc.js, поэтому цифры совпадают с экраном статистики.

import {
    buildGames,
    buildProfile,
    getSides,
    getOutcome,
    toNumber,
    GRAND_ALLIANCES,
    ROUNDS_COUNT,
} from './gamesCalc'

// Пороги значков (при необходимости поправьте под свой турнир)
export const BIG_WIN_DIFF = 30          // «Разгром»: победа с разницей от 30 VP
export const CLOSE_WIN_DIFF = 5         // «Стальные нервы»: победа с разницей не больше 5 VP
export const IRON_STREAK = 3            // «Железная серия»: побед подряд
export const MIN_GAMES_UNDEFEATED = 3   // «Без поражений»: минимум игр
export const COMEBACK_WINS = 3          // «Камбэк»: побед после поражения в первой игре
export const MIN_PLAYERS_FOR_UNIQUE = 10 // «Единственный...»: не выдаём на совсем маленьких турнирах
export const TOP_PLACES = 3

const normalize = (value) => String(value || '').trim().toLowerCase()

const countBy = (items, getKey) => {
    const counts = new Map()
    items.forEach((item) => {
        const key = getKey(item)
        if (key) counts.set(key, (counts.get(key) || 0) + 1)
    })
    return counts
}

// Победитель номинации: больше всего голосов, при равенстве выше место (как в JudgeNominations)
const pickWinner = (profiles, getValue, places) => {
    let best = null
    profiles.forEach((profile) => {
        const value = getValue(profile)
        if (!(value > 0)) return
        const place = places.get(String(profile.id)) ?? Infinity
        if (!best || value > best.value || (value === best.value && place < best.place)) {
            best = {id: String(profile.id), value, place}
        }
    })
    return best ? best.id : null
}

/**
 * Общий контекст турнира. Строим один раз на экран, дальше calcPlayerCard берёт из него нужное.
 * standing - players.standing (уже отсортирован по местам), isFinished - признак из meta
 */
export const buildTournamentContext = (playersData = [], standing = [], roundsCount = ROUNDS_COUNT, isFinished = false) => {
    const places = new Map()
    standing.forEach((item, index) => places.set(String(item.id), index + 1))

    const profiles = new Map()
    playersData.forEach((p) => profiles.set(String(p.id), buildProfile(p)))
    const all = [...profiles.values()]

    const {games} = buildGames(playersData, roundsCount)
    const sides = getSides(games)
    const sidesByPlayer = new Map()
    sides.forEach((side) => {
        const key = String(side.player.id)
        if (!sidesByPlayer.has(key)) sidesByPlayer.set(key, [])
        sidesByPlayer.get(key).push(side)
    })
    sidesByPlayer.forEach((list) => list.sort((a, b) => a.round - b.round))

    const woundsValues = all.map((p) => toNumber(p.stat.wounds)).filter((v) => v !== null && v > 0)
    const vpValues = sides.map((s) => s.vp).filter((v) => v !== null)

    // лучший игрок каждого Гранд Альянса по месту
    const allianceLeaders = new Map()
    GRAND_ALLIANCES.forEach((name) => {
        let best = null
        all.filter((p) => p.grandAlliance === name).forEach((p) => {
            const place = places.get(String(p.id))
            if (place !== undefined && (!best || place < best.place)) best = {id: String(p.id), place}
        })
        if (best) allianceLeaders.set(name, best.id)
    })

    // сложность пути: место в списке по opp_p (1 = самый сложный путь)
    const pathValues = all.map((p) => toNumber(p.player.opp_p)).filter((v) => v !== null && v > 0).sort((a, b) => b - a)

    return {
        isFinished: Boolean(isFinished),
        total: standing.length || all.length,
        places,
        profiles,
        sidesByPlayer,
        armyCounts: countBy(all, (p) => p.allegiance),
        cityCounts: countBy(all, (p) => normalize(p.player.city)),
        wounds: {
            max: woundsValues.length ? Math.max(...woundsValues) : 0,
            min: woundsValues.length ? Math.min(...woundsValues) : 0,
        },
        topVp: vpValues.length ? Math.max(...vpValues) : 0,
        allianceLeaders,
        pathValues,
        nominations: {
            paint: pickWinner(all, (p) => toNumber(p.player.my_paint) || 0, places),
            sport: pickWinner(all, (p) => toNumber(p.player.my_sport) || 0, places),
            hardestPath: pickWinner(all, (p) => toNumber(p.player.opp_p) || 0, places),
        },
    }
}

// Что нужно значкам про конкретного игрока
const buildMe = (ctx, profile) => {
    const id = String(profile.id)
    const sides = ctx.sidesByPlayer.get(id) || []

    let streak = 0
    let current = 0
    let prevRound = null
    sides.forEach((side) => {
        if (prevRound !== null && side.round !== prevRound + 1) current = 0
        current = side.outcome === 'win' ? current + 1 : 0
        streak = Math.max(streak, current)
        prevRound = side.round
    })

    const vpValues = sides.map((s) => s.vp).filter((v) => v !== null)

    return {
        profile,
        id,
        place: ctx.places.get(id) ?? null,
        sides,
        wins: sides.filter((s) => s.outcome === 'win').length,
        draws: sides.filter((s) => s.outcome === 'draw').length,
        losses: sides.filter((s) => s.outcome === 'loss').length,
        streak,
        vpValues,
        maxVp: vpValues.length ? Math.max(...vpValues) : 0,
        city: normalize(profile.player.city),
    }
}

const wonWhere = (me, predicate) => me.sides.some((s) => s.outcome === 'win' && predicate(s))

// kind: main - серьёзные, fun - шуточные. needsFinish - выдаётся только когда в meta isFinished = true
export const BADGES = [
    // ---------- Серьёзные ----------
    {
        id: 'champion', kind: 'main', icon: '🏆', needsFinish: true,
        title: 'Чемпион турнира', caption: 'Все остальные смотрят на вас снизу вверх',
        how: 'Занять 1 место по итогам турнира',
        check: (ctx, me) => me.place === 1,
    },
    {
        id: 'podium', kind: 'main', icon: '🏅', needsFinish: true,
        title: 'Призёр', caption: 'Пьедестал занят, и вы на нём',
        how: 'Занять 2 или 3 место по итогам турнира',
        check: (ctx, me) => me.place !== null && me.place >= 2 && me.place <= TOP_PLACES,
    },
    {
        id: 'alliance_leader', kind: 'main', icon: '🛡️',
        title: 'Лучший в Альянсе', caption: 'Никто из вашего Гранд Альянса не выступил лучше',
        how: 'Занять лучшее место среди игроков своего Гранд Альянса',
        check: (ctx, me) => ctx.allianceLeaders.get(me.profile.grandAlliance) === me.id,
    },
    {
        id: 'paint_winner', kind: 'main', icon: '🎨', needsFinish: true,
        title: 'Мастер кисти', caption: 'Лучший покрас турнира по мнению игроков',
        how: 'Получить больше всех голосов в конкурсе покраса',
        check: (ctx, me) => ctx.nominations.paint === me.id,
    },
    {
        id: 'sport_winner', kind: 'main', icon: '🤝', needsFinish: true,
        title: 'Самый приятный игрок', caption: 'С ним приятно играть: так решили соперники',
        how: 'Получить больше всех голосов за спортивность',
        check: (ctx, me) => ctx.nominations.sport === me.id,
    },
    {
        id: 'hardest_path', kind: 'main', icon: '⛰️', needsFinish: true,
        title: 'Сложнейший путь', caption: 'Самые сильные соперники турнира достались именно вам',
        how: 'Пройти самый сложный турнирный путь',
        check: (ctx, me) => ctx.nominations.hardestPath === me.id,
    },
    {
        id: 'verified', kind: 'main', icon: '✅',
        title: 'Армия проверена', caption: 'Фотовалидация пройдена, к бою готов',
        how: 'Пройти фотовалидацию ростера',
        check: (ctx, me) => Boolean(Number(me.profile.player.paint_checked)) || me.profile.player.paint_checked === true,
    },
    {
        id: 'undefeated', kind: 'main', icon: '💎',
        title: 'Без поражений', caption: 'Ни одного поражения, соперники в печали',
        how: `Не проиграть ни одной игры (сыграв не меньше ${MIN_GAMES_UNDEFEATED})`,
        check: (ctx, me) => me.sides.length >= MIN_GAMES_UNDEFEATED && me.losses === 0,
    },

    // ---------- Шуточные ----------
    {
        id: 'iron_streak', kind: 'fun', icon: '⛓️',
        title: 'Железная серия', caption: 'Остановить этот поезд оказалось невозможно',
        how: `Выиграть ${IRON_STREAK} игры подряд`,
        check: (ctx, me) => me.streak >= IRON_STREAK,
    },
    {
        id: 'crush', kind: 'fun', icon: '💥',
        title: 'Разгром', caption: 'Соперник до сих пор пересчитывает очки',
        how: `Победить с разницей от ${BIG_WIN_DIFF} VP`,
        check: (ctx, me) => wonWhere(me, (s) => s.vpDiff !== null && s.vpDiff >= BIG_WIN_DIFF),
    },
    {
        id: 'nerves', kind: 'fun', icon: '🧊',
        title: 'Стальные нервы', caption: 'Две победы на последних очках, пульс при этом 60',
        how: `Дважды победить с разницей не больше ${CLOSE_WIN_DIFF} VP`,
        check: (ctx, me) => me.sides.filter((s) => s.outcome === 'win' && s.vpDiff !== null && s.vpDiff <= CLOSE_WIN_DIFF).length >= 2,
    },
    {
        id: 'diplomat', kind: 'fun', icon: '🌍',
        title: 'Дипломат', caption: 'Успел повоевать со всеми Гранд Альянсами',
        how: 'Сыграть против игроков всех четырёх Гранд Альянсов',
        check: (ctx, me) => new Set(me.sides.map((s) => s.opponent.grandAlliance).filter(Boolean)).size >= GRAND_ALLIANCES.length,
    },
    {
        id: 'mirror', kind: 'fun', icon: '🪞',
        title: 'Зеркальщик', caption: 'Сыграл против себя самого (ну, почти)',
        how: 'Сыграть зеркальную игру',
        check: (ctx, me) => me.sides.some((s) => s.isMirror),
    },
    {
        id: 'lone_army', kind: 'fun', icon: '🦄',
        title: 'Единственный в своём роде', caption: 'Больше никто не решился взять эту армию',
        how: 'Быть единственным игроком со своей армией',
        check: (ctx, me) => ctx.total >= MIN_PLAYERS_FOR_UNIQUE && Boolean(me.profile.allegiance) && ctx.armyCounts.get(me.profile.allegiance) === 1,
    },
    {
        id: 'heavy', kind: 'fun', icon: '🐘',
        title: 'Тяжеловес', caption: 'Больше всех вундов на столе, ставить миниатюры тесно',
        how: 'Иметь больше всех вундов в ростере',
        check: (ctx, me) => {
            const wounds = toNumber(me.profile.stat.wounds)
            return wounds !== null && ctx.wounds.max > ctx.wounds.min && wounds === ctx.wounds.max
        },
    },
    {
        id: 'minimal', kind: 'fun', icon: '🪶',
        title: 'Минималист', caption: 'Меньше всех вундов, зато с характером',
        how: 'Иметь меньше всех вундов в ростере',
        check: (ctx, me) => {
            const wounds = toNumber(me.profile.stat.wounds)
            return wounds !== null && wounds > 0 && ctx.wounds.max > ctx.wounds.min && wounds === ctx.wounds.min
        },
    },
    {
        id: 'vp_record', kind: 'fun', icon: '🎯',
        title: 'Рекордсмен VP', caption: 'Самая результативная игра турнира',
        how: 'Набрать больше всех VP за одну игру',
        check: (ctx, me) => ctx.topVp > 0 && me.maxVp === ctx.topVp,
    },
    {
        id: 'draw_master', kind: 'fun', icon: '⚖️',
        title: 'Мастер ничьей', caption: 'Идеальный баланс сил, все разошлись довольными',
        how: 'Сыграть вничью',
        check: (ctx, me) => me.draws >= 1,
    },
    {
        id: 'hometown', kind: 'fun', icon: '🏠',
        title: 'Землякам привет', caption: 'Пришлось играть с земляком, даже здесь от них не спрятаться',
        how: 'Сыграть с игроком из своего города',
        check: (ctx, me) => Boolean(me.city) && me.sides.some((s) => normalize(s.opponent.profile.player.city) === me.city),
    },
    {
        id: 'comeback', kind: 'fun', icon: '🔄',
        title: 'Камбэк', caption: 'Начал с поражения, а закончил с улыбкой',
        how: `Проиграть первую игру и выиграть после неё минимум ${COMEBACK_WINS}`,
        check: (ctx, me) => me.sides.length > 0
            && me.sides[0].outcome === 'loss'
            && me.sides.slice(1).filter((s) => s.outcome === 'win').length >= COMEBACK_WINS,
    },
    {
        id: 'lone_city', kind: 'fun', icon: '🧭',
        title: 'Далёкий гость', caption: 'Единственный участник из своего города',
        how: 'Быть единственным участником из своего города',
        check: (ctx, me) => ctx.total >= MIN_PLAYERS_FOR_UNIQUE && Boolean(me.city) && ctx.cityCounts.get(me.city) === 1,
    },
    {
        id: 'giant_slayer', kind: 'fun', icon: '🗡️',
        title: 'Убийца гигантов', caption: `Победил игрока из топ-${TOP_PLACES}, и это было красиво`,
        how: `Выиграть у игрока из топ-${TOP_PLACES}, находясь за его пределами`,
        check: (ctx, me) => me.place !== null && me.place > TOP_PLACES
            && wonWhere(me, (s) => (ctx.places.get(String(s.opponent.id)) ?? Infinity) <= TOP_PLACES),
    },
]

const LOCKED_NOTE = 'Станет известно после награждения'

const calcBadges = (ctx, me) => {
    const earned = []
    const locked = []
    BADGES.forEach(({check, needsFinish, ...badge}) => {
        const isAvailable = !needsFinish || ctx.isFinished
        if (isAvailable && check(ctx, me)) {
            earned.push(badge)
        } else {
            locked.push({...badge, note: needsFinish && !ctx.isFinished ? LOCKED_NOTE : null})
        }
    })
    // серьёзные впереди шуточных, внутри групп порядок из каталога
    earned.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'main' ? -1 : 1))
    return {earned, locked, total: BADGES.length}
}

/**
 * Данные карточки одного игрока. Возвращает null, если игрока нет в списке
 */
export const calcPlayerCard = (ctx, playerId, roundsCount = ROUNDS_COUNT) => {
    const profile = ctx.profiles.get(String(playerId))
    if (!profile) return null
    const me = buildMe(ctx, profile)
    const player = profile.player

    const tpFromGames = me.sides.reduce((sum, s) => sum + s.tp, 0)
    const tpSum = toNumber(player.tp_sum) ?? tpFromGames
    const vpSum = me.vpValues.reduce((sum, v) => sum + v, 0)

    // игры по раундам, в том числе назначенные без результата (идёт игра)
    const rounds = []
    for (let round = 1; round <= roundsCount; round++) {
        const opponentId = player[`game_${round}_opp`]
        if (!opponentId) continue
        const opponentProfile = ctx.profiles.get(String(opponentId))
        const tp = toNumber(player[`game_${round}_tp`])
        rounds.push({
            round,
            table: toNumber(player[`game_${round}_table`]) || null,
            opponent: opponentProfile
                ? {
                    id: opponentProfile.id,
                    fullName: opponentProfile.fullName,
                    allegiance: opponentProfile.allegiance,
                    grandAlliance: opponentProfile.grandAlliance,
                    player: opponentProfile.player,
                }
                : null,
            tp,
            vp: toNumber(player[`game_${round}_vp`]),
            oppVp: opponentProfile ? toNumber(opponentProfile.player[`game_${round}_vp`]) : null,
            outcome: tp === null ? null : getOutcome(tp),
        })
    }

    // самая крупная победа по VP
    const bigWins = me.sides.filter((s) => s.outcome === 'win' && s.vpDiff !== null && s.vpDiff > 0)
    const bestWin = bigWins.reduce((best, s) => (!best || s.vpDiff > best.vpDiff ? s : best), null)

    // сложность пути
    const pathValue = toNumber(player.opp_p)
    const pathRank = pathValue !== null && pathValue > 0 ? ctx.pathValues.indexOf(pathValue) + 1 : null

    return {
        id: profile.id,
        fullName: profile.fullName,
        city: player.city || '',
        allegiance: profile.allegiance,
        grandAlliance: profile.grandAlliance,
        place: me.place,
        total: ctx.total,
        record: {games: me.sides.length, wins: me.wins, draws: me.draws, losses: me.losses},
        tpSum,
        vpSum,
        avgVp: me.vpValues.length ? Math.round((vpSum / me.vpValues.length) * 10) / 10 : null,
        streak: me.streak,
        bestWin: bestWin ? {diff: bestWin.vpDiff, round: bestWin.round, opponent: bestWin.opponent.fullName} : null,
        path: pathValue !== null && pathValue > 0 ? {value: pathValue, rank: pathRank} : null,
        rounds,
        badges: calcBadges(ctx, me),
    }
}
