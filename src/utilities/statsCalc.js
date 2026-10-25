import Constants from '../Constants'

import map from 'lodash/map'

const safeParse = (value) => {
    if (!value) return null
    if (typeof value === 'object') return value
    try {
        return JSON.parse(value)
    } catch (e) {
        return null
    }
}

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null
    const number = Number(value)
    return Number.isNaN(number) ? null : number
}

// В сохранённом ростере тактики - строки, в билдере - объекты {name}. Поддерживаем оба варианта
const toTacticName = (tactic) => (typeof tactic === 'string' ? tactic : tactic?.name || '').trim()

const round1 = (n) => Math.round(n * 10) / 10
const percentOf = (count, total) => (total ? Math.round((count / total) * 100) : 0)
const average = (values) => (values.length ? round1(values.reduce((sum, v) => sum + v, 0) / values.length) : null)

const countBy = (items, getKey) => {
    const counts = new Map()
    items.forEach((item) => {
        const key = getKey(item)
        if (key) counts.set(key, (counts.get(key) || 0) + 1)
    })
    return counts
}

// Игроки со сданным ростером. wounds и drops есть только в roster_stat, остальное берём из roster
export const buildEntries = (playersData = []) =>
    playersData
        .map((p) => {
            const roster = safeParse(p.roster)
            if (!roster) return null
            const info = safeParse(p.roster_stat) || {}
            return {
                id: p.id,
                fullName: `${p.surname} ${p.name}`,
                roster,
                info,
                grandAlliance: roster.grandAlliance || info.grandAlliance || '',
                allegiance: roster.allegiance || info.allegiance || '',
            }
        })
        .filter(Boolean)

export const calcPreTournamentStats = (playersData = []) => {
    const entries = buildEntries(playersData)
    const total = entries.length

    // 1. Гранд Альянсы (всегда все четыре, даже если игроков 0)
    const grandAllianceCounts = countBy(entries, (e) => e.grandAlliance)
    const grandAlliances = map(Constants.grandAlliances, (alliance) => {
        const count = grandAllianceCounts.get(alliance.name) || 0
        return {name: alliance.name, count, percent: percentOf(count, total)}
    })

    // 2. Армии
    const armyCounts = countBy(entries, (e) => e.allegiance)
    const armyAlliance = {}
    entries.forEach((e) => {
        if (e.allegiance) armyAlliance[e.allegiance] = e.grandAlliance
    })
    const armies = [...armyCounts]
        .map(([name, count]) => ({name, grandAlliance: armyAlliance[name], count, percent: percentOf(count, total)}))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    // 3. Вунды по Гранд Альянсам
    const woundsEntries = entries
        .map((e) => ({entry: e, value: toNumber(e.info.wounds)}))
        .filter((x) => x.value !== null && x.value > 0)
    const woundsByAlliance = map(Constants.grandAlliances, (alliance) => {
        const values = woundsEntries.filter((x) => x.entry.grandAlliance === alliance.name).map((x) => x.value)
        return {
            name: alliance.name,
            count: values.length,
            avg: average(values),
            min: values.length ? Math.min(...values) : null,
            max: values.length ? Math.max(...values) : null,
        }
    })
    const most = woundsEntries.reduce((best, x) => (!best || x.value > best.value ? x : best), null)
    const fewest = woundsEntries.reduce((best, x) => (!best || x.value < best.value ? x : best), null)
    const wounds = {
        byAlliance: woundsByAlliance,
        overallAvg: average(woundsEntries.map((x) => x.value)),
        scaleMax: woundsEntries.length ? Math.max(...woundsEntries.map((x) => x.value)) : 0,
        most: most && {fullName: most.entry.fullName, value: most.value},
        fewest: fewest && {fullName: fewest.entry.fullName, value: fewest.value},
    }

    // 4. Дропы (гистограмма от минимума до максимума, пропуски заполняем нулями)
    const dropValues = entries.map((e) => toNumber(e.info.drops)).filter((v) => v !== null)
    const histogram = []
    if (dropValues.length) {
        for (let drops = Math.min(...dropValues); drops <= Math.max(...dropValues); drops++) {
            histogram.push({drops, count: dropValues.filter((v) => v === drops).length})
        }
    }
    const drops = {histogram, avg: average(dropValues)}

    // 5. Тактики
    const tacticLists = entries
        .map((e) => [...new Set((Array.isArray(e.roster.tactics) ? e.roster.tactics : []).map(toTacticName).filter(Boolean))])
        .filter((list) => list.length)
    const tacticCounts = new Map()
    tacticLists.forEach((list) => list.forEach((name) => tacticCounts.set(name, (tacticCounts.get(name) || 0) + 1)))
    const cards = [...tacticCounts]
        .map(([name, count]) => ({name, count, percent: percentOf(count, tacticLists.length)}))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    const pairCounts = new Map()
    tacticLists
        .filter((list) => list.length === 2)
        .forEach((list) => {
            const key = [...list].sort().join('|')
            pairCounts.set(key, (pairCounts.get(key) || 0) + 1)
        })
    // только повторяющиеся пары, иначе список состоит из одних единиц
    const pairs = [...pairCounts]
        .map(([key, count]) => ({names: key.split('|'), count}))
        .filter((pair) => pair.count > 1)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    return {
        total,
        grandAlliances,
        armies,
        wounds,
        drops,
        tactics: {cards, pairs, rostersCount: tacticLists.length},
    }
}
