import React from 'react'
import {useNavigate} from 'react-router-dom'
import Constants from '../Constants'
import {roster, player, navigationState} from '../utilities/appState'
import {getStringAfterDash} from '../utilities/utils'
import BuilderRow from './BuilderRow'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import compact from 'lodash/compact'

import Styles from './styles/ChooseGrandAlliance.module.css'

const dataBase = require('../dataBase.json')

const ChooseGrandAlliance = () => {
    const navigate = useNavigate()

    const handleClick = ({grandAlliance}) => {
        roster.grandAlliance = grandAlliance.name
    }

    const getUnits = (units) => map(units, (unit) => {
        const _unit = find(dataBase.data.warscroll, ['id', unit.id])
        return {..._unit, ...unit}
    })

    const getTactic = (tacticName) => {
        const tacticCard = find(dataBase.data.rule_container, (card) => getStringAfterDash(card.title) === tacticName)
        return tacticCard ? {...tacticCard, name: tacticName} : null
    }

    const handleNavigateToRoster = (list) => () => {
        const regiments = map(JSON.parse(list.regiments), (regiment) => {
            const _regiment = JSON.parse(regiment)
            const units = getUnits(_regiment.units)
            return {..._regiment, units}
        })
        let tactics = JSON.parse(list.tactics)
        if (size(tactics) > 0) {
            tactics = compact(map(tactics, getTactic))
        }
        roster.id = list.id
        roster.allegiance = list.allegiance
        roster.allegianceId = list.allegiance_id
        roster.auxiliaryUnits = list.auxiliary_units ? getUnits(JSON.parse(list.auxiliary_units)) : []
        roster.battleFormation = list.battle_formation
        roster.factionTerrain = list.faction_terrain
        roster.generalRegimentIndex = list.general_regiment_index
        roster.grandAlliance = list.grand_alliance
        roster.manifestationLore = list.manifestation_lore
        roster.manifestationsList = list.manifestations_list ? getUnits(JSON.parse(list.manifestations_list)) : []
        roster.points = JSON.parse(list.points) || {all: 0}
        roster.pointsLimit = list.points_limit
        roster.prayersLore = list.prayers_lore
        roster.regimentOfRenown = list.regiment_of_renown ? find(dataBase.data.ability_group, ['id', JSON.parse(list.regiment_of_renown)?.id]) : null
        roster.regiments = regiments
        roster.regimentsOfRenownUnits = list.regiments_of_renown_units ? getUnits(JSON.parse(list.regiments_of_renown_units)) : []
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