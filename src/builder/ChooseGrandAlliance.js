import React from 'react'
import {useNavigate} from 'react-router-dom'
import Constants from '../Constants'
import {roster, player, navigationState} from '../utilities/appState'
import {getStringAfterDash, checkForOnlyOneInRegiment} from '../utilities/utils'
import BuilderRow from './BuilderRow'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import sumBy from 'lodash/sumBy'
import filter from 'lodash/filter'
import compact from 'lodash/compact'
import forEach from 'lodash/forEach'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'
import findIndex from 'lodash/findIndex'

import Styles from './styles/ChooseGrandAlliance.module.css'

const dataBase = require('../dataBase.json')

const ChooseGrandAlliance = () => {
    const navigate = useNavigate()
    let newPoints = {all: 0}

    const handleClick = ({grandAlliance}) => {
        roster.grandAlliance = grandAlliance.name
    }

    const getEncantmentsPoints = (unit) => {
        let points = 0
        forEach(unit, key => {
            const abilities = filter(dataBase.data.ability, ['name', key])
            if (!isEmpty(abilities)) {
                const abilityGroups = map(abilities, ability => find(dataBase.data.ability_group, ['id', ability.abilityGroupId]))
                const groupIndex = findIndex(abilityGroups, group => group.abilityGroupType !== 'spearheadEnhancements')
                points += abilities[groupIndex]?.points || 0
            }
        })
        return points
    }

    const getUnits = (units, withPoinsCheck, isRoR) => map(units, (unit) => {
        const _unit = find(dataBase.data.warscroll, ['id', unit.id])
        if (withPoinsCheck && unit.points && _unit.points && unit.points !== _unit.points) {
            let points = unit.points
            if (includes(_unit.referenceKeywords, 'Hero') ) {
                const encantmentsPoints = getEncantmentsPoints(unit)
                if (unit.points !== (_unit.points + encantmentsPoints)) {
                    points = _unit.points + encantmentsPoints
                }
            } else {
                if (unit.isReinforced) {
                    if (unit.points !== (_unit.points * 2)) {
                        points = _unit.points * 2
                    }
                } else if (unit.points !== _unit.points) {
                    points = _unit.points
                }
            }
            if (unit.points !== points && !isRoR) {
                newPoints.all -= unit.points - points
            }
            return {..._unit, ...unit, points}
        } else {
            return {..._unit, ...unit}
        }
    })

    const getTactic = (tacticName) => {
        const tacticCard = find(dataBase.data.rule_container, (card) => getStringAfterDash(card.title) === tacticName)
        return tacticCard ? {...tacticCard, name: tacticName} : null
    }

    const updatePoints = (name, dataName, pointsName) => {
        const namePoints = find(dataBase.data[dataName], ['name', name])?.points || 0
        if (newPoints[pointsName] && !namePoints) {
            newPoints.all -= newPoints[pointsName]
        } else if (!newPoints[pointsName] && namePoints) {
            newPoints.all += namePoints
        }
        newPoints[pointsName] = namePoints
    }

    const checkPoints = (list) => {
        if (list.faction_terrain) {
            updatePoints(list.faction_terrain, 'warscroll', 'terrain')
        }
        if (list.battle_formation) {
            updatePoints(list.battle_formation, 'battle_formation', 'battleFormation')
        }
        if (list.spells_lore) {
            updatePoints(list.spells_lore, 'lore', 'spellsLore')
        }
        if (list.spells_lore) {
            updatePoints(list.prayers_lore, 'lore', 'prayersLore')
        }
        if (list.spells_lore) {
            updatePoints(list.manifestation_lore, 'lore', 'manifestations')
        }
    }

    const handleNavigateToRoster = (list) => () => {
        newPoints = JSON.parse(list.points) || {all: 0}
        const regiments = map(JSON.parse(list.regiments), (regiment) => {
            const _regiment = JSON.parse(regiment)
            const units = getUnits(_regiment.units, true)
            const regimentPoints = sumBy(units, 'points')
            return checkForOnlyOneInRegiment({..._regiment, units, points: regimentPoints}, list.allegiance_id)
        })
        checkPoints(list)
        let tactics = JSON.parse(list.tactics)
        if (size(tactics) > 0) {
            tactics = compact(map(tactics, getTactic))
        }
        roster.id = list.id
        roster.allegiance = list.allegiance
        roster.allegianceId = list.allegiance_id
        roster.auxiliaryUnits = list.auxiliary_units ? getUnits(JSON.parse(list.auxiliary_units), true) : []
        roster.battleFormation = list.battle_formation
        roster.factionTerrain = list.faction_terrain
        roster.generalRegimentIndex = list.general_regiment_index
        roster.grandAlliance = list.grand_alliance
        roster.manifestationLore = list.manifestation_lore
        roster.manifestationsList = list.manifestations_list ? getUnits(JSON.parse(list.manifestations_list)) : []
        roster.points = newPoints
        roster.pointsLimit = list.points_limit
        roster.prayersLore = list.prayers_lore
        roster.regimentOfRenown = list.regiment_of_renown ? find(dataBase.data.ability_group, ['id', JSON.parse(list.regiment_of_renown)?.id]) : null
        roster.regiments = regiments
        roster.regimentsOfRenownUnits = list.regiments_of_renown_units ? getUnits(JSON.parse(list.regiments_of_renown_units), true, true) : []
        roster.tactics = tactics
        roster.spellsLore = list.spells_lore
        roster.isPublic = list.is_public
        roster.note = list.note
        roster.listName = list.list_name
        navigationState.isBuilder = true
        navigate('/builder', {state: {title: list.allegiance, alliganceId: list.allegiance_id}})
    }

    const renderRow = (grandAlliance) => <BuilderRow
        key={grandAlliance.id}
        title={grandAlliance.name}
        navigateTo='chooseFaction'
        state={{grandAlliance}}
        onClick={handleClick}
    />

    const renderList = (list) => {
        const army = find(dataBase.data.faction_keyword, ['id', list.allegiance_id])
        return <div id={Styles.listContainer} key={list.id}>
            <button id={Styles.button} onClick={handleNavigateToRoster(list)} key={list.id}>
                <img src={army?.moreInfoImage} alt={army?.name} id={Styles.image} />
                <div id={Styles.textContainer}>
                    <p id={Styles.text}>{list.name}</p>
                    <p id={Styles.text}>{army?.name}</p>
                </div>
            </button>
        </div>
    }

    return  <div id='column' className='Chapter'>
        <h4 id={Styles.title}>Choose your Grand Alliance</h4>
        {Constants.grandAlliances.map(renderRow)}
        {size(player.mainRosters)
            ? <>
                <h4 id={Styles.title}>Your saved rosters</h4>
                <div id={Styles.buttonContainer}>
                    {map(player.mainRosters, renderList)}
                </div>
            </>
            : null
        }
    </div>
}

export default ChooseGrandAlliance