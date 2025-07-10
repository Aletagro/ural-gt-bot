import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Textarea from '@mui/joy/Textarea'
import {getTextAfter, parseRegiments, getStringAfterDash} from '../utilities/utils'
import {roster, navigationState} from '../utilities/appState'

import map from 'lodash/map'
import find from 'lodash/find'
import sumBy from 'lodash/sumBy'
import split from 'lodash/split'
import filter from 'lodash/filter'
import compact from 'lodash/compact'

import Styles from './styles/PasteList.module.css'

const dataBase = require('../dataBase.json')

const PasteList = () => {
    const navigate = useNavigate()
    const [list, setList] = useState('')

    const getUnit = (unit) => {
        const _units = find(dataBase.data.warscroll, warscroll => warscroll.name === unit.name && !warscroll.isSpearhead)
        return {
            ..._units,
            ...unit,
            isReinforced: !(_units?.modelCount === unit.modelCount),
            modelCount: _units?.modelCount,
            artefact: unit.Artefact,
            heroicTrait: unit['Heroic Trait']
        }
    }

    const setRegiment = (regiment) => {
        const points = sumBy(regiment, 'points')
        const units = map(regiment, getUnit) 
        return {units, points, heroId: units[0]?.id || ''}
    }

    const getTactic = (tacticName) => {
        const tacticCard = find(dataBase.data.rule_container, (card) => getStringAfterDash(card.title) === tacticName)
        return tacticCard ? {...tacticCard, name: tacticName} : null
    }

    const getRegimentOfRenown = (rorName) => find(dataBase.data.ability_group, ['name', rorName])

    const getPoints = (allPoints, factionTerrain, prayers, spells, manifestationLore) => {
        if (allPoints) {
            const terrain = find(dataBase.data.warscroll, ['name', factionTerrain])?.points || 0
            const prayersLore = find(dataBase.data.lore, ['name', prayers])?.points || 0
            const spellsLore = find(dataBase.data.lore, ['name', spells])?.points || 0
            const manifestations = find(dataBase.data.lore, ['name', manifestationLore])?.points || 0
            return {all: Number(allPoints), terrain, prayersLore, spellsLore, manifestations}
        }
        return {all: 0}
    }

    const handleNavigateToRoster = () => {
        const allegiance = getTextAfter(list, 'Faction:')
        const allegianceId = find(dataBase.data.faction_keyword, ['name', allegiance])?.id
        if (allegianceId) {
            const manifestationLore = split(getTextAfter(list, 'Manifestation Lore:'), ' (')[0]
            const manifestationLoreId = find(dataBase.data.lore, ['name', manifestationLore])?.id
            const manifestationSpells = filter(dataBase.data.lore_ability, ['loreId', manifestationLoreId])
            const manifestationsList = map(manifestationSpells, spell => find(dataBase.data.warscroll, ['id', spell.linkedWarscrollId]))
            const splitPoints = split(getTextAfter(list, 'Pts', true), '/')
            const parsedRegiments = parseRegiments(list)
            const regiments = map(parsedRegiments.regiments, setRegiment)
            const tacticsString = getTextAfter(list, 'Battle Tactics Cards:')
            const tactics = compact(map(split(tacticsString, ' and '), getTactic))
            const factionTerrain = split(getTextAfter(list, 'Faction Terrain:'), ' (')[0]
            const prayersLore = split(getTextAfter(list, 'Prayer Lore:'), ' (')[0]
            const spellsLore = split(getTextAfter(list, 'Spell Lore:'), ' (')[0]
            const points = getPoints(splitPoints[0], factionTerrain, prayersLore, spellsLore, manifestationLore)

            roster.allegiance = allegiance
            roster.allegianceId = allegianceId
            roster.auxiliaryUnits = map(parsedRegiments.auxiliaryUnits, getUnit)
            roster.battleFormation = getTextAfter(list, 'Battle Formation:')
            roster.factionTerrain = factionTerrain
            roster.generalRegimentIndex = parsedRegiments.generalIndex
            roster.grandAlliance = getTextAfter(list, 'Grand Alliance:')
            roster.manifestationLore = manifestationLore
            roster.manifestationsList = manifestationsList
            roster.points = points
            roster.pointsLimit = splitPoints[1]
            roster.prayersLore = prayersLore
            roster.regimentOfRenown = getRegimentOfRenown(parsedRegiments.regimentOfRenown.name)
            roster.regiments = regiments
            roster.regimentsOfRenownUnits = map(parsedRegiments.regimentOfRenown.units, getUnit)
            roster.tactics = tactics
            roster.spellsLore = spellsLore
            navigationState.isBuilder = true
            navigate('/builder', {state: {title: allegiance, alliganceId: allegianceId}})
        }
    }

    const handleBlurName = (e) => {
        setList(e.target.value)
    }

    return <div id='column' className='Chapter'>
        <Textarea sx={inputStyles.listName} onBlur={handleBlurName} placeholder='Paste List' />
        <p id={Styles.notice}>Paste list into input. List must be created in this bot</p>
        <button id={Styles.button} onClick={handleNavigateToRoster}>Go To Builder</button>
    </div>
}

export default PasteList

const inputStyles = {
    listName: {
        minHeight: '48px',
        borderRadius: '4px',
        borderColor: '#B4B4B4',
        color: '#000000',
        fontFamily: 'Minion Pro Regular',
        marginBottom: '4px'
    }
}

