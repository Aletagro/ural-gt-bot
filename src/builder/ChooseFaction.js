import React from 'react';
import {useLocation} from 'react-router-dom'
import {roster, player, navigationState} from '../utilities/appState'
import {sortByName, cleanBuilder, getStringAfterDash} from '../utilities/utils'
import BuilderRow from './BuilderRow'
import HeaderImage from '../components/HeaderImage'
import Constants from '../Constants'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import compact from 'lodash/compact'
import includes from 'lodash/includes'

import Styles from './styles/ChooseFaction.module.css'

const dataBase = require('../dataBase.json')

const ChooseFaction = () => {
    const {grandAlliance} = useLocation().state
    let allegiances = dataBase.data.faction_keyword.filter((faction) => faction.parentFactionKeywordId === grandAlliance.id)
    const armiesOfRenown = map(allegiances, ({id}) => dataBase.data.faction_keyword.filter(({parentFactionKeywordId, armyOfRenown}) => parentFactionKeywordId === id && armyOfRenown))?.filter(array => array.length > 0)
    // нужно чтобы орков разделить на отдельные книги
    if (grandAlliance.name === 'Destruction') {
        const orrukWarclansId = allegiances.find(allegiance => allegiance.name === 'Orruk Warclans')?.id
        const orrukAllegiances = dataBase.data.faction_keyword.filter((faction) => faction.parentFactionKeywordId === orrukWarclansId && !faction.armyOfRenown)
        allegiances = [...allegiances, ...orrukAllegiances]
        allegiances = allegiances.filter(allegiance => allegiance.name !== 'Orruk Warclans')
    }
    sortByName(allegiances)

    const getUnits = (units) => map(units, (unit) => {
        const _unit = find(dataBase.data.warscroll, ['id', unit.id])
        return {..._unit, ...unit}
    })

    const getTactic = (tacticName) => {
        const tacticCard = find(dataBase.data.rule_container, (card) => getStringAfterDash(card.title) === tacticName)
        return tacticCard ? {...tacticCard, name: tacticName} : null
    }

    const handleSetRoster = (list) => {
        const regiments = map(list.regiments, (regiment) => {
            const units = getUnits(regiment.units)
            return {...regiment, units}
        })
        let tactics = []
        if (size(list.tactics) > 0) {
            tactics = compact(map(list.tactics, getTactic))
        }
        roster.id = list.id
        roster.allegiance = list.allegiance
        roster.allegianceId = list.allegianceId
        roster.auxiliaryUnits = list.auxiliaryUnits ? getUnits(list.auxiliaryUnits) : []
        roster.battleFormation = list.battleFormation
        roster.factionTerrain = list.factionTerrain
        roster.generalRegimentIndex = list.generalRegimentIndex
        roster.grandAlliance = list.grandAlliance
        roster.manifestationLore = list.manifestationLore
        roster.manifestationsList = list.manifestationsList ? getUnits(list.manifestationsList) : []
        roster.points = list.points || {all: 0}
        roster.pointsLimit = list.pointsLimit
        roster.prayersLore = list.prayersLore
        roster.regimentOfRenown = list.regimentOfRenown ? find(dataBase.data.ability_group, ['id', list.regimentOfRenown?.id]) : null
        roster.regiments = regiments
        roster.regimentsOfRenownUnits = list.regimentsOfRenownUnits ? getUnits(list.regimentsOfRenownUnits) : []
        roster.tactics = tactics
        roster.spellsLore = list.spellsLore
    }

    const handleClick = ({allegiance}) => {
        const list = player.roster ? JSON.parse(player?.roster) : undefined
        if (list?.allegianceId === allegiance.id) {
            handleSetRoster(list)
        } else if (roster.allegianceId !== allegiance.id) {
            cleanBuilder()
            roster.allegiance = allegiance.name
            roster.allegianceId = allegiance.id
        }
        navigationState.isBuilder = true
    }
    
    const renderRow = (allegiance) => {
        const isLegendaryArmies = includes(Constants.legendaryArmies, allegiance.id)
        return <BuilderRow
            key={allegiance.id}
            title={`${allegiance.name}${isLegendaryArmies ? ' (Legend)' : ''}`}
            navigateTo='builder'
            state={{allegiance}}
            onClick={handleClick}
        />
    }

    const renderArmyOfRenown = (army) => map(army, renderRow)

    return <>
        <HeaderImage src={grandAlliance.image} alt={grandAlliance.name} isWide />
        <div id='column' className='Chapter'>
            <h4 id={Styles.title}>Choose your Faction</h4>
            {allegiances && map(allegiances, renderRow)}
            {armiesOfRenown.length > 0
                ? <>
                    <h4 id={Styles.title}>Armies Of Renown</h4>
                    {map(armiesOfRenown, renderArmyOfRenown)}
                </>
                : null
            }
        </div>
    </>
}

export default ChooseFaction