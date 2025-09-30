import React from 'react'

import get from 'lodash/get'
import map from 'lodash/map'
import size from 'lodash/size'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'

import Styles from './styles/Roster.module.css'

const dataBase = require('../dataBase.json')

const RosterEasy = ({roster, info}) => {
    const points = roster.points || {}
    let otherEnhancements = []
    const otherEnhancementsGroups = filter(dataBase.data.ability_group, (item) => item.factionId === roster.allegianceId && item.abilityGroupType === 'otherEnhancements')
    if (size(otherEnhancementsGroups)) {
        forEach(otherEnhancementsGroups, otherEnhancementsGroup => {
            const abilities = filter(dataBase.data.ability, ['abilityGroupId', otherEnhancementsGroup.id])
            otherEnhancements.push({name: otherEnhancementsGroup?.name, id: otherEnhancementsGroup?.id, abilities})
        })
    }

    const renderWeapon = ([key, value]) => value
        ? <p>&#8226; {value} x {key}</p>
        : null

    const renderWeaponOption = ([key, value]) => {
        return map(Object.entries(value), renderWeapon)
    }

    const renderWeaponOptions = (weaponOptions) => map(Object.entries(weaponOptions), renderWeaponOption)

    const renderUnit = (unit, index) => <div key={`${unit.id}-${index}`}>
        <p><b>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x` : ''} {unit.name}</b> ({unit.points || unit.regimentOfRenownPointsCost || 0} points)</p>
        {unit.artefact ? <p>&#8226; {unit.artefact}</p> : null}
        {unit.heroicTrait ? <p>&#8226; {unit.heroicTrait}</p> : null}
        {unit.weaponOptions ? renderWeaponOptions(unit.weaponOptions) : null}
        {unit.marksOfChaos ? <p>&#8226; Mark Of Chaos: {unit.marksOfChaos}</p> : null}
        {map(otherEnhancements, (otherEnhancement) =>
            unit[otherEnhancement?.name] ? <p key={otherEnhancement.id}>&#8226; {otherEnhancement?.name}: {unit[otherEnhancement?.name]}</p> : null
        )}
        {unit.otherWarscrollOption ? <p>&#8226; {unit.otherWarscrollOption}</p> : null}
    </div>

    const renderRegimentsOfRenownUnit = (unit) => <div>
        <p>{unit.modelCount ? `${unit.modelCount} x` : ''} {unit.name}</p>
        {unit.artefact ? <p>&#8226; {unit.artefact}</p> : null}
        {unit.heroicTrait ? <p>&#8226; {unit.heroicTrait}</p> : null}
        {unit.otherWarscrollOption ? <p>&#8226; {unit.otherWarscrollOption}</p> : null}
    </div>

    const renderRegiment = (regiment, index) => <div key={index}>
        <p>Regiment {index + 1}</p>
        {roster.generalRegimentIndex === index ? <p>General's regiment</p> : null}
        {map(regiment.units, renderUnit)}
        <br/>
    </div>

    return <div id={Styles.container}>
        <p>Grand Alliance: {roster.grandAlliance}</p>
        <p>Faction: {roster.allegiance}</p>
        <p>Battle Formation: {roster.battleFormation}{points.battleFormation ? ` (${points.battleFormation} points)` : null}</p>
        <p>Battle Tactics Cards: {get(roster, 'tactics[0]', '')}{size(roster.tactics) === 2 ? ` and ${get(roster, 'tactics[1]', '')}` : ''}</p>
        <p>Drops: {info.drops}</p>
        {size(roster.auxiliaryUnits) ? <p>Auxiliaries: {size(roster.auxiliaryUnits)}</p> : null}
        <br/>
        {roster.spellsLore ? <p>Spell Lore: {roster.spellsLore}{points.spellsLore ? ` (${points.spellsLore} points)` : null}</p> : null}
        {roster.prayersLore ? <p>Prayer Lore: {roster.prayersLore}{points.prayersLore ? ` (${points.prayersLore} points)` : null}</p> : null}
        {roster.manifestationLore ? <p>Manifestation Lore: {roster.manifestationLore}{points.manifestations ? ` (${points.manifestations} points)` : null}</p> : null}
        {roster.factionTerrain ? <p>Faction Terrain: {roster.factionTerrain}{points.terrain ? ` (${points.terrain} points)` : null}</p> : null}
        <hr/>
        {map(roster.regiments, renderRegiment)}
        <hr/>
        {size(roster.auxiliaryUnits)
            ? <div>
                <p>Auxiliary Units</p>
                {map(roster.auxiliaryUnits, renderUnit)}
                <hr/>
            </div>
            : null
        }
        {roster.regimentOfRenown
            ? <div>
                <p>Regiment Of Renown</p>
                {renderUnit(roster.regimentOfRenown)}
                {map(roster.regimentsOfRenownUnits, renderRegimentsOfRenownUnit)}
                <hr/>
            </div>
            : null
        }
        <p>Wounds: {info.wounds}</p>
        <p>{points.all}/{roster.pointsLimit} Pts</p>
    </div>
}

export default RosterEasy
