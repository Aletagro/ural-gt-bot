import React from 'react'
import {Document, Page, View, Text, StyleSheet, Font} from '@react-pdf/renderer'

import get from 'lodash/get'
import map from 'lodash/map'
import size from 'lodash/size'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'

const dataBase = require('../dataBase.json')

Font.register({
    family: 'PTSerif',
    fonts: [
        {src: `${process.env.PUBLIC_URL || ''}/fonts/PTSerif-Regular.ttf`},
        {src: `${process.env.PUBLIC_URL || ''}/fonts/PTSerif-Bold.ttf`, fontWeight: 700},
    ],
})
// Не переносить слова по слогам (иначе названия юнитов рвутся странно)
Font.registerHyphenationCallback((word) => [word])

const s = StyleSheet.create({
    page: {paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontFamily: 'PTSerif', fontSize: 10.5, color: '#1a1a1a'},
    header: {borderBottomWidth: 2, borderBottomColor: '#8a6d1f', paddingBottom: 6, marginBottom: 10},
    playerName: {fontSize: 20, fontWeight: 700},
    playerMeta: {fontSize: 10, color: '#666', marginTop: 2},
    line: {marginBottom: 2},
    divider: {borderBottomWidth: 1, borderBottomColor: '#bbb', marginVertical: 8},
    sectionTitle: {fontWeight: 700, fontSize: 12, marginBottom: 4},
    regiment: {marginBottom: 8},
    regimentTitle: {fontWeight: 700, color: '#8a6d1f', marginBottom: 3},
    unit: {marginBottom: 5},
    bullet: {marginLeft: 12, color: '#333'},
    total: {fontWeight: 700, marginTop: 2},
    footer: {position: 'absolute', bottom: 20, left: 40, right: 40, fontSize: 8, color: '#888', textAlign: 'center'},
})

// Те же "otherEnhancements", что считаются в RosterEasy
const getOtherEnhancements = (roster) => {
    const result = []
    const groups = filter(
        dataBase.data.ability_group,
        (item) => item.factionId === roster.allegianceId && item.abilityGroupType === 'otherEnhancements'
    )
    forEach(groups, (group) => result.push({name: group?.name, id: group?.id}))
    return result
}

const Bullet = ({children}) => <Text style={s.bullet}>• {children}</Text>

const Unit = ({unit, otherEnhancements}) => {
    const count = unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x ` : ''
    const points = unit.points || unit.regimentOfRenownPointsCost || 0
    return (
        <View style={s.unit} wrap={false}>
            <Text>
                <Text style={{fontWeight: 700}}>{count}{unit.name}</Text> ({points} points)
            </Text>
            {unit.artefact ? <Bullet>{unit.artefact}</Bullet> : null}
            {unit.heroicTrait ? <Bullet>{unit.heroicTrait}</Bullet> : null}
            {unit.weaponOptions
                ? map(Object.entries(unit.weaponOptions), ([optKey, option]) =>
                    map(Object.entries(option), ([weapon, qty]) =>
                        qty ? <Bullet key={`${optKey}-${weapon}`}>{qty} x {weapon}</Bullet> : null
                    )
                )
                : null}
            {unit.marksOfChaos ? <Bullet>Mark Of Chaos: {unit.marksOfChaos}</Bullet> : null}
            {map(otherEnhancements, (enh) =>
                unit[enh.name] ? <Bullet key={enh.id}>{enh.name}: {unit[enh.name]}</Bullet> : null
            )}
            {unit.otherWarscrollOption ? <Bullet>{unit.otherWarscrollOption}</Bullet> : null}
        </View>
    )
}

const RorUnit = ({unit}) => (
    <View style={s.unit} wrap={false}>
        <Text>{unit.modelCount ? `${unit.modelCount} x ` : ''}{unit.name}</Text>
        {unit.artefact ? <Bullet>{unit.artefact}</Bullet> : null}
        {unit.heroicTrait ? <Bullet>{unit.heroicTrait}</Bullet> : null}
        {unit.otherWarscrollOption ? <Bullet>{unit.otherWarscrollOption}</Bullet> : null}
    </View>
)

const withPoints = (value, pts) => (pts ? `${value} (${pts} points)` : value)

const RosterBody = ({roster, info}) => {
    const points = roster.points || {}
    const otherEnhancements = getOtherEnhancements(roster)
    const tactics = size(roster.tactics) === 2
        ? `${get(roster, 'tactics[0]', '')} and ${get(roster, 'tactics[1]', '')}`
        : get(roster, 'tactics[0]', '')

    return (
        <View>
            <Text style={s.line}>Grand Alliance: {roster.grandAlliance}</Text>
            <Text style={s.line}>Faction: {roster.allegiance}</Text>
            <Text style={s.line}>Battle Formation: {withPoints(roster.battleFormation, points.battleFormation)}</Text>
            <Text style={s.line}>Battle Tactics Cards: {tactics}</Text>
            <Text style={s.line}>Drops: {info.drops}</Text>
            {size(roster.auxiliaryUnits) ? <Text style={s.line}>Auxiliaries: {size(roster.auxiliaryUnits)}</Text> : null}

            <View style={{marginTop: 6}}>
                {roster.spellsLore ? <Text style={s.line}>Spell Lore: {withPoints(roster.spellsLore, points.spellsLore)}</Text> : null}
                {roster.prayersLore ? <Text style={s.line}>Prayer Lore: {withPoints(roster.prayersLore, points.prayersLore)}</Text> : null}
                {roster.manifestationLore ? <Text style={s.line}>Manifestation Lore: {withPoints(roster.manifestationLore, points.manifestations)}</Text> : null}
                {roster.factionTerrain ? <Text style={s.line}>Faction Terrain: {withPoints(roster.factionTerrain, points.terrain)}</Text> : null}
            </View>

            <View style={s.divider} />

            {map(roster.regiments, (regiment, index) => (
                <View key={index} style={s.regiment}>
                    <Text style={s.regimentTitle} minPresenceAhead={40}>
                        Regiment {index + 1}{roster.generalRegimentIndex === index ? " — General's regiment" : ''}
                    </Text>
                    {map(regiment.units, (unit, i) => (
                        <Unit key={`${unit.id}-${i}`} unit={unit} otherEnhancements={otherEnhancements} />
                    ))}
                </View>
            ))}

            <View style={s.divider} />

            {size(roster.auxiliaryUnits) ? (
                <View>
                    <Text style={s.sectionTitle}>Auxiliary Units</Text>
                    {map(roster.auxiliaryUnits, (unit, i) => (
                        <Unit key={`${unit.id}-${i}`} unit={unit} otherEnhancements={otherEnhancements} />
                    ))}
                    <View style={s.divider} />
                </View>
            ) : null}

            {roster.regimentOfRenown ? (
                <View>
                    <Text style={s.sectionTitle}>Regiment Of Renown</Text>
                    <Unit unit={roster.regimentOfRenown} otherEnhancements={otherEnhancements} />
                    {map(roster.regimentsOfRenownUnits, (unit, i) => <RorUnit key={i} unit={unit} />)}
                    <View style={s.divider} />
                </View>
            ) : null}

            <Text style={s.line}>Wounds: {info.wounds}</Text>
            <Text style={s.total}>{points.all}/{roster.pointsLimit} Pts</Text>
        </View>
    )
}

/**
 * entries: [{id, surname, name, city, roster (объект), info (объект)}]
 */
const RostersPdf = ({entries, tournamentName = ''}) => (
    <Document title={`${tournamentName} — ростеры`}>
        {map(entries, (entry) => {
            const fullName = `${entry.surname} ${entry.name}`
            return (
                <Page key={entry.id} size='A4' style={s.page}>
                    <View style={s.header}>
                        <Text style={s.playerName} bookmark={{title: fullName}}>{fullName}</Text>
                        {entry.city ? <Text style={s.playerMeta}>{entry.city}</Text> : null}
                    </View>

                    <RosterBody roster={entry.roster} info={entry.info} />

                    {/* fixed: повторяется на каждой странице этого игрока */}
                    <Text
                        fixed
                        style={s.footer}
                        render={({pageNumber, totalPages}) =>
                            `${tournamentName ? `${tournamentName} / ` : ''}${fullName} / ${pageNumber}/${totalPages}`}
                    />
                </Page>
            )
        })}
    </Document>
)

export default RostersPdf