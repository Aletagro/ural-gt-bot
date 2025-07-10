import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import Ability from '../components/Ability'
import RowImage from '../components/RowImage'

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
            return {name: formation?.name, id: formation?.id, abilities: formationsRules[index]}
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
        if (isRoRUnitWithKeyword) {
            const newUnit = {...roster.regimentsOfRenownUnits[unitIndex], [type]: enhancement.name}
            roster.regimentsOfRenownUnits[unitIndex] = newUnit
        } else if (isAuxiliary) {
            const newUnit = {...roster.auxiliaryUnits[unitIndex], [type]: enhancement.name}
            roster.auxiliaryUnits[unitIndex] = newUnit
        } else {
            let newUnit = {}
            let enhancementPointsDiff = 0
            if (enhancement.points !== (roster.regiments[regimentIndex].units[unitIndex][`${type}-points`] || 0)) {
                enhancementPointsDiff = enhancement.points - (roster.regiments[regimentIndex].units[unitIndex][`${type}-points`] || 0)
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
        }
        if (type === 'spellsLore' && block.points !== roster.points.spellsLore) {
            const pointsDiff = block.points - (roster.points.spellsLore || 0)
            roster.points.all += pointsDiff
            roster.points.spellsLore = block.points
        }
        if (type === 'factionTerrain' && block.points !== roster.points.terrain) {
            const pointsDiff = block.points - (roster.points.terrain || 0)
            roster.points.all += pointsDiff
            roster.points.terrain = block.points
        }
        navigate(-1)
    }

    const handleDeleteEnhancement = () => {
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
            } else if (type === 'factionTerrain' && roster.points.terrain) {
                roster.points.all -= roster.points.terrain
                roster.points.terrain = 0
            }
        } else if (isRoRUnitWithKeyword) {
            const newUnit = {...roster.regimentsOfRenownUnits[unitIndex], [type]: ''}
            roster.regimentsOfRenownUnits[unitIndex] = newUnit
        } else if (isAuxiliary) {
            const newUnit = {...roster.auxiliaryUnits[unitIndex], [type]: ''}
            roster.auxiliaryUnits[unitIndex] = newUnit
        } else {
            let newUnit = {}
            const enhancementPoints = roster.regiments[regimentIndex].units[unitIndex][`${type}-points`]
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