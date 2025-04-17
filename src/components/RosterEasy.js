import React from 'react'

import map from 'lodash/map'
import size from 'lodash/size'

import Styles from './styles/Roster.module.css'

const additionalOptions = ['Ensorcelled Banners', 'First Circle Titles']

const RosterEasy = ({roster, info}) => {

    const renderWeapon = ([key, value]) => value
        ? <p>&#8226; {value} x {key}</p>
        : null

    const renderWeaponOption = ([key, value]) => {
        return map(Object.entries(value), renderWeapon)
    }

    const renderWeaponOptions = (weaponOptions) => map(Object.entries(weaponOptions), renderWeaponOption)

    const renderAdditionalOption = (unit) => (additionalOption) =>
        unit[additionalOption] ? <p>&#8226; {additionalOption}: {unit[additionalOption]}</p> : null


    const renderUnit = (unit, index) => <div key={`${unit.id}-${index}`}>
        <p><b>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x` : ''} {unit.name}</b> ({unit.points || unit.regimentOfRenownPointsCost || 0} points)</p>
        {unit.artefact ? <p>&#8226; {unit.artefact}</p> : null}
        {unit.heroicTrait ? <p>&#8226; {unit.heroicTrait}</p> : null}
        {unit.weaponOptions ? renderWeaponOptions(unit.weaponOptions) : null}
        {unit.marksOfChaos ? <p>&#8226; Mark Of Chaos: {unit.marksOfChaos}</p> : null}
        {map(additionalOptions, renderAdditionalOption(unit))}
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
    </div>
    
    return <div id={Styles.container}>
        <p>Grand Alliance: {roster.grandAlliance}</p>
        <p>Faction: {roster.allegiance}</p>
        <p>Battle Formation: {roster.battleFormation}</p>
        <p>Drops: {info.drops}</p>
        {size(roster.auxiliaryUnits) && <p>Auxiliaries: {size(roster.auxiliaryUnits)}</p>}
        <br/>
        {roster.spellsLore ? <p>Spell Lore: {roster.spellsLore}</p> : null}
        {roster.prayersLore ? <p>Prayer Lore: {roster.prayersLore}</p> : null}
        {roster.manifestationLore ? <p>Manifestation Lore: {roster.manifestationLore}</p> : null}
        {roster.factionTerrain ? <p>Faction Terrain: {roster.factionTerrain}</p> : null}
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
        <p>{roster.points}/{roster.pointsLimit} Pts</p>
    </div>
}

export default RosterEasy
