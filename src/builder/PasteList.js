import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Textarea from '@mui/joy/Textarea'
import Checkbox from '../components/Checkbox'
import {getTextAfter, parseRegiments, getStringAfterDash, getFactionForWHAoS, parseRegimentsForWHAoS, findCommonOptionId, setRosterGrandAlliance, parseListForListbot} from '../utilities/utils'
import {roster, navigationState} from '../utilities/appState'
import Constants from '../Constants'

import map from 'lodash/map'
import trim from 'lodash/trim'
import find from 'lodash/find'
import last from 'lodash/last'
import size from 'lodash/size'
import sumBy from 'lodash/sumBy'
import split from 'lodash/split'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import compact from 'lodash/compact'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/PasteList.module.css'

const dataBase = require('../dataBase.json')

const spellIncludesTexts = ['Lore of', 'Spell Lore', 'Arcane']
const manifestationsIncludesTexts = ['Lore of the Abyss']

const PasteList = () => {
    const navigate = useNavigate()
    const [list, setList] = useState('')
    const [source, setSource] = useState('OurApp')
    
    const getWHAoSEnhancements = (enhancements) => {
        const data = {}
        forEach(enhancements, enhancement => {
            const abilities = filter(dataBase.data.ability, ['name', enhancement])
            const abilityGroups = map(abilities, ability => find(dataBase.data.ability_group, ['id', ability.abilityGroupId]))
            const keyType = find(abilityGroups, group => group.abilityGroupType !== 'spearheadEnhancements')
            if (keyType) {
                let key = ''
                if (keyType.abilityGroupType === 'artefactsOfPower') {
                    key = 'artefact'
                } else if (keyType.abilityGroupType === 'heroicTraits') {
                    key = 'heroicTrait'
                } else {
                    key = keyType.name
                }
                if (key) {
                    data[key] = enhancement
                }
            }
        })
        return data
    }
    
    const getListbotEnhancements = (enhancements, unitId) => {
        const data = {weaponOptions: {}}
        forEach(enhancements, enhancement => {
            const abilities = filter(dataBase.data.ability, ['name', enhancement])
            const abilityGroups = map(abilities, ability => find(dataBase.data.ability_group, ['id', ability.abilityGroupId]))
            const keyType = find(abilityGroups, group => group.abilityGroupType !== 'spearheadEnhancements')
            if (keyType) {
                let key = ''
                if (keyType.abilityGroupType === 'artefactsOfPower') {
                    key = 'artefact'
                } else if (keyType.abilityGroupType === 'heroicTraits') {
                    key = 'heroicTrait'
                } else {
                    key = keyType.name
                }
                if (key) {
                    data[key] = enhancement
                }
            } else {
                const weaponsArr = filter(dataBase.data.warscroll_weapon, item => includes(enhancement, item.name) && item.warscrollId === unitId)
                const optionsWeapons = map(weaponsArr, item => filter(dataBase.data.option_weapon, ['weaponId', item.id]))
                const optionId = findCommonOptionId(optionsWeapons)
                const optionGroupId = find(dataBase.data.option, ['id', optionId])?.optionGroupId
                if (optionGroupId) {
                    if (!data.weaponOptions[optionGroupId]) {
                        data.weaponOptions[optionGroupId] = {}
                    }
                    forEach(weaponsArr, item => {
                        if (data.weaponOptions[optionGroupId][item.name]) {
                            data.weaponOptions[optionGroupId][item.name] ++
                        } else {
                            data.weaponOptions[optionGroupId][item.name] = 1
                        }
                    })
                }
            }
        })
        return data
    }

    const getWeapons = (weapons, unitId) => {
        const data = {}
        forEach(weapons, weapon => {
            const match = weapon.match(/^(\d+)/)
            if (match) {
                const value = parseInt(match[0], 10)
                const weaponName = trim(weapon.replace(match[0], ''))
                if (weaponName) {
                    const weaponsArr = filter(dataBase.data.warscroll_weapon, item => includes(weaponName, item.name) && item.warscrollId === unitId)
                    const optionsWeapons = map(weaponsArr, item => filter(dataBase.data.option_weapon, ['weaponId', item.id]))
                    const optionId = findCommonOptionId(optionsWeapons)
                    const optionGroupId = find(dataBase.data.option, ['id', optionId])?.optionGroupId
                    if (optionGroupId) {
                        data[optionGroupId] = {}
                        forEach(weaponsArr, item => {
                            data[optionGroupId][item.name] = value
                        })
                    }
                }
            }
        })
        return data
    }

    const getUnit = (unit) => {
        const _unit = find(dataBase.data.warscroll, warscroll => warscroll.name === unit.name && !warscroll.isSpearhead)
        let enhancements = {}
        let weaponOptions = {}
        if (source === 'WHAoS') {
            enhancements = getWHAoSEnhancements(unit.enhancements)
        } else if (source === 'Listbot') {
            enhancements = getListbotEnhancements(unit.enhancements, _unit.id)
        }
        weaponOptions = getWeapons(unit.weapons, _unit.id)
        return {
            ..._unit,
            ...unit,
            isReinforced: _unit.cannotBeReinforced ? false :  _unit.points !== unit.points, 
            modelCount: _unit?.modelCount,
            artefact: unit.Artefact,
            heroicTrait: unit['Heroic Trait'],
            weaponOptions,
            ...enhancements

        }
    }

    const setRegiment = (regiment) => {
        const points = sumBy(regiment, 'points')
        const units = map(regiment, getUnit) 
        return {units, points, heroId: units[0]?.id || ''}
    }

    const setTactic = (tacticsString) => {
        if (!tacticsString) {
            return []
        }
        const parts = tacticsString.split(/\s+and\s+/i)
        const matchedParts = []
        // Проверяем комбинации частей, так как "Intercept and Recover" состоит из двух "and"
        for (let i = 0; i < parts.length; i++) {
          for (let j = i + 1; j <= parts.length; j++) {
            const combined = parts.slice(i, j).join(" and ")
            if (includes(Constants.tacticsCards, combined)) {
              matchedParts.push(combined)
              i = j - 1 // Пропускаем уже проверенные части
              break
            }
          }
        }
      
        return matchedParts;
      }

    const getTactic = (tacticName) => {
        const tacticCard = find(dataBase.data.rule_container, (card) => getStringAfterDash(card.title) === tacticName)
        return tacticCard ? {...tacticCard, name: tacticName} : null
    }

    const getRegimentOfRenown = (rorName) => find(dataBase.data.ability_group, ['name', rorName])

    const getRegimentOfRenownUnits = (regimentOfRenownId) => {
        const regimentsOfRenownWarscrollsIds = filter(dataBase.data.ability_group_regiment_of_renown_linked_warscroll, ['abilityGroupId', regimentOfRenownId])
        const regimentsOfRenownUnits = []
        forEach(regimentsOfRenownWarscrollsIds, item => {
            const warscroll = find(dataBase.data.warscroll, ['id', item.warscrollId])
            for (let i = item.instanceCount; i > 0; i--) {
                regimentsOfRenownUnits.push(warscroll)
            }
        })
        return regimentsOfRenownUnits
    }

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

    const getMetaForListbot = (array) => {
        const meta = {tactics: []}
        forEach(array, string => {
            const _string = split(string, ' (')[0]
            const isTactic = find(dataBase.data.battle_tactic_card, card => lowerCase(card.name) === lowerCase(_string))
            if (isTactic) {
                meta.tactics.push(_string)
            } else {
                const lore = find(dataBase.data.lore, ['name', _string])
                if (lore.publicationId === Constants.manifestationsPublicationId || includes(manifestationsIncludesTexts, lore.name)) {
                    meta.manifestationLore = _string
                } else if (find(spellIncludesTexts, text => includes(lore.name, text))) {
                    meta.spellsLore = _string
                } else {
                    meta.prayersLore = _string
                }
            }
        })
        return meta
    }

    const getPointsForListBot = () => {
        const match = list.match(/(\d+)\/(\d+)pts/)
        return match ? [parseInt(match[1]), parseInt(match[2])] : null
    }

    const getRegimentsForListBot = (data) => {
        let regiments = data
        let auxiliaryUnits = []
        let regimentOfRenown = null
        // Проверяем, есть ли RoR
        forEach(data, (regiment, index) => {
            const isRoR = find(dataBase.data.ability_group, group => group.name === regiment[0].name && group.abilityGroupType === 'regimentOfRenown')
            if (isRoR) {
                regimentOfRenown = isRoR
                // Если после рора есть еще реджимент, то скидыаем его в Auxiliary
                if (data[index + 1]) {
                    auxiliaryUnits = data[index + 1]
                    regiments = data.slice(0, size(data) - 2)
                } else {
                    regiments = data.slice(0, size(data) - 1)
                }
            }
        })
        // Проверяем, есть ли Auxiliary Units
        if (!regimentOfRenown) {
            const lastUnit = find(dataBase.data.warscroll, ['name', last(data)[0].name])
            const isLastUnitHero = includes(lastUnit.referenceKeywords, 'Hero')
            if (!isLastUnitHero || size(data) > 5) {
                auxiliaryUnits = last(data)
                regiments = data.slice(0, size(data) - 1)
            }
        }
        return {regiments, auxiliaryUnits, regimentOfRenown}
    }

    const handleNavigateUseOurApp = () => {
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
            const tacticsString = setTactic(getTextAfter(list, 'Battle Tactics Cards:'))
            const tactics = compact(map(tacticsString, getTactic))
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

    const handleNavigateUseWHAoS = () => {
        const listInfo = getFactionForWHAoS(list)
        const allegianceId = find(dataBase.data.faction_keyword, ['name', listInfo[1]])?.id
        if (allegianceId) {
            const factionTerrain = split(getTextAfter(list, 'Faction Terrain', false, true), ' (')[0]
            const manifestationLore = split(getTextAfter(list, 'Manifestation Lore -'), ' (')[0]
            const manifestationLoreId = find(dataBase.data.lore, ['name', manifestationLore])?.id
            const manifestationSpells = filter(dataBase.data.lore_ability, ['loreId', manifestationLoreId])
            const manifestationsList = map(manifestationSpells, spell => find(dataBase.data.warscroll, ['id', spell.linkedWarscrollId]))
            const prayersLore = split(getTextAfter(list, 'Prayer Lore -'), ' (')[0]
            const spellsLore = split(getTextAfter(list, 'Spell Lore -'), ' (')[0]
            const tacticsString = setTactic(getTextAfter(list, 'Battle Tactics Cards:'))
            const tactics = compact(map(tacticsString, getTactic))
            const splitPoints = split(split(getTextAfter(list, 'pts', true), ' ')[1], '/')
            const points = getPoints(splitPoints[0], factionTerrain, prayersLore, spellsLore, manifestationLore)
            const parsedRegiments = parseRegimentsForWHAoS(list)
            const regiments = map(parsedRegiments.regiments, setRegiment)
            const regimentOfRenown = getRegimentOfRenown(parsedRegiments.regimentOfRenown.name)

            roster.allegiance = listInfo[1]
            roster.allegianceId = allegianceId
            roster.auxiliaryUnits = map(parsedRegiments.auxiliaryUnits, getUnit)
            roster.battleFormation = listInfo[2]
            roster.factionTerrain = factionTerrain
            roster.generalRegimentIndex = parsedRegiments.generalIndex
            roster.grandAlliance = listInfo[0] === 'Orruk Warclans' ? 'Destruction' : getTextAfter(listInfo[0], 'Grand Alliance')
            roster.manifestationLore = manifestationLore
            roster.manifestationsList = manifestationsList
            roster.points = points
            roster.pointsLimit = splitPoints[1]
            roster.prayersLore = prayersLore
            roster.regimentOfRenown = regimentOfRenown
            roster.regiments = regiments
            roster.regimentsOfRenownUnits = getRegimentOfRenownUnits(regimentOfRenown?.id)
            roster.tactics = tactics
            roster.spellsLore = spellsLore
            navigationState.isBuilder = true
            navigate('/builder', {state: {title: listInfo[1], alliganceId: allegianceId}})
        }
    }

    const handleNavigateUseListbot = () => {
        const allegiance = list.split('\n')[0]
        const allegianceId = find(dataBase.data.faction_keyword, ['name', allegiance])?.id
        if (allegianceId) {
            setRosterGrandAlliance(allegiance)
            const parsedList = parseListForListbot(list)
            const meta = getMetaForListbot(parsedList.meta)
            const tactics = compact(map(meta.tactics, getTactic))
            const manifestationLoreId = find(dataBase.data.lore, ['name', meta.manifestationLore])?.id
            const manifestationSpells = filter(dataBase.data.lore_ability, ['loreId', manifestationLoreId])
            const manifestationsList = map(manifestationSpells, spell => find(dataBase.data.warscroll, ['id', spell.linkedWarscrollId]))
            const splitPoints = getPointsForListBot()
            const points = getPoints(splitPoints[0], parsedList.factionTerrain, meta.prayersLore, meta.spellsLore, meta.manifestationLore)
            const {regiments, auxiliaryUnits, regimentOfRenown} = getRegimentsForListBot(parsedList.regiments)

            roster.allegiance = allegiance
            roster.allegianceId = allegianceId
            roster.auxiliaryUnits = map(auxiliaryUnits, getUnit)
            roster.battleFormation = list.split('\n')[1]
            roster.factionTerrain = parsedList.factionTerrain
            roster.generalRegimentIndex = parsedList.generalIndex
            roster.manifestationLore = meta.manifestationLore
            roster.manifestationsList = manifestationsList
            roster.points = points
            roster.pointsLimit = splitPoints[1]
            roster.prayersLore = meta.prayersLore
            roster.regimentOfRenown = regimentOfRenown
            roster.regiments = map(regiments, setRegiment)
            roster.regimentsOfRenownUnits = getRegimentOfRenownUnits(regimentOfRenown?.id)
            roster.tactics = tactics
            roster.spellsLore = meta.spellsLore
            navigationState.isBuilder = true
            navigate('/builder', {state: {title: allegiance, alliganceId: allegianceId}})
        }
    }

    const handleNavigateToRoster = () => {
        switch (source) {
            case 'OurApp':
                handleNavigateUseOurApp()
                break
            case 'WHAoS':
                handleNavigateUseWHAoS()
                break
            case 'Listbot':
                handleNavigateUseListbot()
                break
            default:
                return null
        }
    }

    const handleBlurName = (e) => {
        setList(e.target.value)
    }

    const handleChooseOurApp = () => {
        setSource('OurApp')
    }

    const handleChangeWHAoS = () => {
        setSource('WHAoS')
    }

    const handleChangeListbot = () => {
        setSource('Listbot')
    }

    return <div id='column' className='Chapter'>
        <Textarea sx={inputStyles.listName} onBlur={handleBlurName} placeholder='Paste List' />
        <p id={Styles.notice}>List created in:</p>
        <div onClick={handleChooseOurApp} id={Styles.sourceRow}>
            <Checkbox onClick={handleChooseOurApp} checked={source === 'OurApp'} />
            <p id={Styles.sourceTitle}>This App</p>
        </div>
        <div onClick={handleChangeWHAoS} id={Styles.sourceRow}>
            <Checkbox onClick={handleChangeWHAoS} checked={source === 'WHAoS'} />
            <p id={Styles.sourceTitle}>WH AoS App</p>
        </div>
        <div onClick={handleChangeListbot} id={Styles.sourceRow}>
            <Checkbox onClick={handleChangeListbot} checked={source === 'Listbot'} />
            <p id={Styles.sourceTitle}>Listbot</p>
        </div>
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
        marginBottom: '16px'
    }
}
