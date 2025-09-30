import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import Ability from '../components/Ability'
import RowImage from '../components/RowImage'

import find from 'lodash/find'

import Styles from './styles/ChooseEnhancement.module.css'

const dataBase = require('../dataBase.json')

const ChooseEnhancement = () => {
    const {
        data, type, unitIndex, regimentIndex, title, isInfo, isRosterInfo, isAuxiliary, isAdditionalOption, isRoRUnitWithKeyword
    } = useLocation().state
    const navigate = useNavigate()
    let _data = data
    let info = {}
    if (type === 'battleFormation') {
        const formationsRules = data.map(formation => dataBase.data.battle_formation_rule.filter((item) => item.battleFormationId === formation?.id))
        _data = data.map((formation, index) => {
            return {name: formation?.name, id: formation?.id, points:formation?.points, abilities: formationsRules[index]}
        })
    }
    if (type === 'spellsLore' || type === 'prayersLore') {
        const loresRules = data.map(lore => dataBase.data.lore_ability.filter((item) => item.loreId === lore?.id))
        _data = data.map((lore, index) => {
            return {name: lore?.name, id: lore?.id, points: lore?.points || 0, abilities: loresRules[index]}
        })
        info = {
            abilityKeywordsName: 'lore_ability_keyword',
            abilityIdName: 'loreAbilityId'
        }
    }
    if (type === 'factionTerrain') {
        _data = data.map((terrain, index) => ({name: terrain?.name, id: terrain?.id, points: terrain?.points || 0}))
    }
    if (type === 'manifestationLore') {
        const lores = data.map(lore => dataBase.data.lore_ability.filter((item) => item.loreId === lore?.id))
        const units = lores.map(lore => lore.map(spell => dataBase.data.warscroll.find(warscroll => warscroll.id === spell.linkedWarscrollId)))
        _data = data.map((lore, index) => {
            return {name: lore?.name, id: lore?.id, points: lore?.points || 0, abilities: units[index]}
        })
    }
    if (isAdditionalOption) {
        _data = dataBase.data.ability.filter(ability => ability.abilityGroupId === data.id)
    }

    const handleClickEnhancement = (enhancement) => {
        let newUnit = {}
        let enhancementPointsDiff = 0
        if (isRoRUnitWithKeyword) {
            let enhancementPoints = roster.regimentsOfRenownUnits[unitIndex][`${type}-points`] || 0
            if (!enhancementPoints) {
                const enhancementName = roster.regimentsOfRenownUnits[unitIndex][type]
                if (enhancementName) {
                    enhancementPoints = find(data, ['name', enhancementName])?.points
                }
            }
            if (enhancement.points !== enhancementPoints) {
                enhancementPointsDiff = enhancement.points - enhancementPoints
                newUnit = {
                    ...roster.regimentsOfRenownUnits[unitIndex],
                    points: roster.regimentsOfRenownUnits[unitIndex].points + enhancementPointsDiff,
                    [type]: enhancement.name,
                    [`${type}-points`]: enhancement.points
                }
                roster.points.all += enhancementPointsDiff
            } else {
                newUnit = {...roster.regimentsOfRenownUnits[unitIndex], [type]: enhancement.name}
            }
            roster.regimentsOfRenownUnits[unitIndex] = newUnit
        } else if (isAuxiliary) {
            let enhancementPoints = roster.auxiliaryUnits[unitIndex][`${type}-points`] || 0
            if (!enhancementPoints) {
                const enhancementName = roster.auxiliaryUnits[unitIndex][type]
                if (enhancementName) {
                    enhancementPoints = find(data, ['name', enhancementName])?.points
                }
            }
            if (enhancement.points !== enhancementPoints) {
                enhancementPointsDiff = enhancement.points - enhancementPoints
                newUnit = {
                    ...roster.auxiliaryUnits[unitIndex],
                    points: roster.auxiliaryUnits[unitIndex].points + enhancementPointsDiff,
                    [type]: enhancement.name,
                    [`${type}-points`]: enhancement.points
                }
                roster.points.all += enhancementPointsDiff
            } else {
                newUnit = {...roster.auxiliaryUnits[unitIndex], [type]: enhancement.name}
            }
            roster.auxiliaryUnits[unitIndex] = newUnit
        } else {
            let enhancementPoints = roster.regiments[regimentIndex].units[unitIndex][`${type}-points`] || 0
            if (!enhancementPoints) {
                const enhancementName = roster.regiments[regimentIndex].units[unitIndex][type]
                if (enhancementName) {
                    enhancementPoints = find(data, ['name', enhancementName])?.points
                }
            }
            if (enhancement.points !== enhancementPoints) {
                enhancementPointsDiff = enhancement.points - enhancementPoints
                newUnit = {
                    ...roster.regiments[regimentIndex].units[unitIndex],
                    points: roster.regiments[regimentIndex].units[unitIndex].points + enhancementPointsDiff,
                    [type]: enhancement.name,
                    [`${type}-points`]: enhancement.points
                }
                roster.regiments[regimentIndex].points += enhancementPointsDiff
                roster.points.all += enhancementPointsDiff
            } else {
                newUnit = {...roster.regiments[regimentIndex].units[unitIndex], [type]: enhancement.name}
            }
            roster.regiments[regimentIndex].units[unitIndex] = newUnit
        }
        navigate(-1)
    }

    const handleClickBlock = (block) => () => {
        roster[type] = block.name
        if (type === 'manifestationLore') {
            roster.manifestationsList = block.abilities
            if (block.points !== roster.points.manifestations) {
                const pointsDiff = block.points - (roster.points.manifestations || 0)
                roster.points.all += pointsDiff
                roster.points.manifestations = block.points
            }
        } else if (type === 'spellsLore' && block.points !== roster.points.spellsLore) {
            const pointsDiff = block.points - (roster.points.spellsLore || 0)
            roster.points.all += pointsDiff
            roster.points.spellsLore = block.points
        } else if (type === 'prayersLore' && block.points !== roster.points.prayersLore) {
            const pointsDiff = block.points - (roster.points.prayersLore || 0)
            roster.points.all += pointsDiff
            roster.points.prayersLore = block.points
        } else if (type === 'factionTerrain' && block.points !== roster.points.terrain) {
            const pointsDiff = block.points - (roster.points.terrain || 0)
            roster.points.all += pointsDiff
            roster.points.terrain = block.points
        } else if (type === 'battleFormation' && block.points !== roster.points.battleFormation) {
            const pointsDiff = block.points - (roster.points.battleFormation || 0)
            roster.points.all += pointsDiff
            roster.points.battleFormation = block.points
        }
        navigate(-1)
    }

    const handleDeleteEnhancement = () => {
        let newUnit = {}
        if (isRosterInfo) {
            roster[type] = ''
            if (type === 'manifestationLore') {
                roster.manifestationsList = []
                if (roster.points.manifestations) {
                    roster.points.all -= roster.points.manifestations
                    roster.points.manifestations = 0
                }
            } else if (type === 'spellsLore' && roster.points.spellsLore) {
                roster.points.all -= roster.points.spellsLore
                roster.points.spellsLore = 0
            } else if (type === 'prayersLore' && roster.points.prayersLore) {
                roster.points.all -= roster.points.prayersLore
                roster.points.prayersLore = 0
            } else if (type === 'factionTerrain' && roster.points.terrain) {
                roster.points.all -= roster.points.terrain
                roster.points.terrain = 0
            } else if (type === 'battleFormation' && roster.points.battleFormation) {
                roster.points.all -= roster.points.battleFormation
                roster.points.battleFormation = 0
            }
        } else if (isRoRUnitWithKeyword) {
            let enhancementPoints = roster.regimentsOfRenownUnits[unitIndex][`${type}-points`]
            if (!enhancementPoints) {
                const enhancementName = roster.regimentsOfRenownUnits[unitIndex][type]
                if (enhancementName) {
                    enhancementPoints = find(data, ['name', enhancementName])?.points
                }
            }
            if (enhancementPoints) {
                newUnit = {
                    ...roster.regimentsOfRenownUnits[unitIndex],
                    [type]: '',
                    points: roster.regimentsOfRenownUnits[unitIndex].points - enhancementPoints,
                    [`${type}-points`]: 0
                }
                roster.points.all -= enhancementPoints
            } else {
                newUnit = {...roster.regimentsOfRenownUnits[unitIndex], [type]: ''}
            }
            roster.regimentsOfRenownUnits[unitIndex] = newUnit
        } else if (isAuxiliary) {
            let enhancementPoints = roster.auxiliaryUnits[unitIndex][`${type}-points`]
            if (!enhancementPoints) {
                const enhancementName = roster.auxiliaryUnits[unitIndex][type]
                if (enhancementName) {
                    enhancementPoints = find(data, ['name', enhancementName])?.points
                }
            }
            if (enhancementPoints) {
                newUnit = {
                    ...roster.auxiliaryUnits[unitIndex],
                    [type]: '',
                    points: roster.auxiliaryUnits[unitIndex].points - enhancementPoints,
                    [`${type}-points`]: 0
                }
                roster.points.all -= enhancementPoints
            } else {
                newUnit = {...roster.auxiliaryUnits[unitIndex], [type]: ''}
            }
            roster.auxiliaryUnits[unitIndex] = newUnit
        } else {
            let enhancementPoints = roster.regiments[regimentIndex].units[unitIndex][`${type}-points`]
            if (!enhancementPoints) {
                const enhancementName = roster.regiments[regimentIndex].units[unitIndex][type]
                if (enhancementName) {
                    enhancementPoints = find(data, ['name', enhancementName])?.points
                }
            }
            if (enhancementPoints) {
                newUnit = {
                    ...roster.regiments[regimentIndex].units[unitIndex],
                    [type]: '',
                    points: roster.regiments[regimentIndex].units[unitIndex].points - enhancementPoints,
                    [`${type}-points`]: 0
                }
                roster.regiments[regimentIndex].points -= enhancementPoints
                roster.points.all -= enhancementPoints
            } else {
                newUnit = {...roster.regiments[regimentIndex].units[unitIndex], [type]: ''}
            }
            roster.regiments[regimentIndex].units[unitIndex] = newUnit
        }
        navigate(-1)
    }

    const handleGoBack = () => {
        navigate(-1)
    }

    const renderEnhancement = (enhancement) => <Ability
        key={enhancement.id}
        ability={enhancement}
        onClick={isRosterInfo ? undefined : handleClickEnhancement}
        {...info}
    />

    const renderManifestation = (manifestation) => <div key={manifestation.id} id={Styles.manifestation}>
        <RowImage src={manifestation.rowImage} alt={manifestation.name} />
        <b>{manifestation.name}</b>
    </div>

    const renderBlock = (block) => <button key={block.id} id={Styles.block} onClick={handleClickBlock(block)}>
        <div id={Styles.blockHeader}>
            <b id={Styles.title}>{block.name}</b>
            {block.points ? <p id={Styles.title}>{block.points} pts</p> : null}
        </div>
        {block.abilities?.map(type === 'manifestationLore' ? renderManifestation : renderEnhancement)}
    </button>

    return  <div id='column' className='Chapter'>
        {_data?.map(isRosterInfo ? renderBlock : renderEnhancement)}
        {isInfo
            ? <button id={Styles.delete} onClick={handleGoBack}>Back</button>
            : <button id={Styles.delete} onClick={handleDeleteEnhancement}>Delete {title}</button>
        }
    </div>
}

export default ChooseEnhancement