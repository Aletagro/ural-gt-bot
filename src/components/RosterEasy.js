import React from 'react'

import Styles from './styles/Roster.module.css'

const additionalOptions = ['Ensorcelled Banners', 'First Circle Titles']

const RosterEasy = ({_roster, info}) => {
    const roster = JSON.parse(_roster2)
    // const roster = JSON.parse(_roster)

    const renderWeapon = ([key, value]) => value
        ? <p>&#8226; {value} x {key}</p>
        : null

    const renderWeaponOption = ([key, value]) => {
        return Object.entries(value).map(renderWeapon)
    }

    const renderWeaponOptions = (weaponOptions) => Object.entries(weaponOptions).map(renderWeaponOption)

    const renderAdditionalOption = (unit) => (additionalOption) =>
        unit[additionalOption] ? <p>&#8226; {additionalOption}: {unit[additionalOption]}</p> : null


    const renderUnit = (unit, index) => <div key={`${unit.id}-${index}`}>
        <p><b>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x` : ''} {unit.name}</b> ({unit.points || unit.regimentOfRenownPointsCost || 0} points)</p>
        {unit.artefact ? <p>&#8226; {unit.artefact}</p> : null}
        {unit.heroicTrait ? <p>&#8226; {unit.heroicTrait}</p> : null}
        {unit.weaponOptions ? renderWeaponOptions(unit.weaponOptions) : null}
        {unit.marksOfChaos ? <p>&#8226; Mark Of Chaos: {unit.marksOfChaos}</p> : null}
        {additionalOptions.map(renderAdditionalOption(unit))}
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
        {regiment.units.map(renderUnit)}
    </div>
    
    return <div id={Styles.container}>
        <p>Grand Alliance: {roster.grandAlliance}</p>
        <p>Faction: {roster.allegiance}</p>
        <p>Battle Formation: {roster.battleFormation}</p>
        <p>Drops: {info.drops}</p>
        {roster.auxiliaryUnits.length > 0 ? <p>Auxiliaries: {roster.auxiliaryUnits.length}</p> : null}
        <br/>
        {roster.spellsLore ? <p>Spell Lore: {roster.spellsLore}</p> : null}
        {roster.prayersLore ? <p>Prayer Lore: {roster.prayersLore}</p> : null}
        {roster.manifestationLore ? <p>Manifestation Lore: {roster.manifestationLore}</p> : null}
        {roster.factionTerrain ? <p>Faction Terrain: {roster.factionTerrain}</p> : null}
        <hr/>
        {roster.regiments.map(renderRegiment)}
        <hr/>
        {roster.auxiliaryUnits.length > 0
            ? <div>
                <p>Auxiliary Units</p>
                {roster.auxiliaryUnits.map(renderUnit)}
                <hr/>
            </div>
            : null
        }
        {roster.regimentOfRenown
            ? <div>
                <p>Regiment Of Renown</p>
                {renderUnit(roster.regimentOfRenown)}
                {roster.regimentsOfRenownUnits?.map(renderRegimentsOfRenownUnit)}
                <hr/>
            </div>
            : null
        }
        <p>Wounds: {info.wounds}</p>
        <p>{roster.points}/{roster.pointsLimit} Pts</p>
    </div>
}

export default RosterEasy

const _roster2 = JSON.stringify({"allegiance":"Gloomspite Gitz","allegianceId":"eef8e883-a05c-40f2-8257-912586275561","auxiliaryUnits":[],"battleFormation":"Squigalanche","factionTerrain":"Bad Moon Loonshrine","generalRegimentIndex":0,"grandAlliance":"Destruction","manifestationLore":"Forbidden Power","manifestationsList":[{"id":"f9370bfa-7ad0-4521-83f3-ca5af73af3a9","name":"Soulscream Bridge"},{"id":"f8066171-9673-4988-889d-019f30f444d3","name":"Lauchon the Soulseeker"},{"id":"2ed329fb-1cff-4020-ba7e-04e38ba1e903","name":"Horrorghast"},{"id":"f91df01a-3e37-4f9c-b83b-32e7436af094","name":"The Shards of Valagharr"}],"points":100,"pointsLimit":2000,"prayersLore":"","regimentOfRenown":null,"regiments":[{"heroId":"46863aa6-986e-4d1f-bdcb-5b77dbeb7666","points":100,"units":[{"id":"46863aa6-986e-4d1f-bdcb-5b77dbeb7666","name":"Fungoid Cave-Shaman","points":100,"modelCount":1}]}],"regimentsOfRenownUnits":[],"spellsLore":"Lore of the Clammy Dank"})