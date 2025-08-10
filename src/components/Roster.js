import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Row from './Row'
import Modal from './Modal'
import Regiment from '../builder/Regiment'
import UnitRow from '../builder/UnitRow'
import Constants from '../Constants'
import {getInfo, getStringAfterDash} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'

import Styles from './styles/Roster.module.css'

const dataBase = require('../dataBase.json')

const Roster = ({roster, info}) => {
    const navigate = useNavigate()
    const [modalData, setModalData] = useState({visible: false, title: '', text: ''})
    let otherEnhancements = []
    const otherEnhancementsGroups = filter(dataBase.data.ability_group, (item) => item.factionId === roster.allegianceId && item.abilityGroupType === 'otherEnhancements')
    if (size(otherEnhancementsGroups)) {
        forEach(otherEnhancementsGroups, otherEnhancementsGroup => {
            const abilities = filter(dataBase.data.ability, ['abilityGroupId', otherEnhancementsGroup.id])
            otherEnhancements.push({name: otherEnhancementsGroup?.name, id: otherEnhancementsGroup?.id, abilities})
        })
    }

    const handleClickAllegiance = () => {
        const armyInfo = getInfo(Constants.armyEnhancements[0], {id: roster.allegianceId, name: roster.allegiance})
        navigate('/armyInfo', {state: {title: Constants.armyEnhancements[0].title, info: armyInfo, allegiance: {name: roster.allegiance}}})
    }

    const handleClickFormation = () => {
        const formations = getInfo(Constants.armyEnhancements[1], {id: roster.allegianceId, name: roster.allegiance})
        formations.abilities = filter(formations.abilities, ['name', roster.battleFormation])
        navigate('/armyInfo', {state: {title: Constants.armyEnhancements[1].title, info: formations, allegiance: {name: roster.allegiance}}})
    }

    const handleClickSpellsLore = () => {
        const lore = find(dataBase.data.lore, ['name', roster.spellsLore])
        const spells = filter(dataBase.data.lore_ability, ['loreId', lore.id])
        const data = {
            title: 'Spells Lore',
            abilities: [{...lore, abilities: spells}]
        }
        navigate('/armyInfo', {state: {title: data.title, info: data, allegiance: {name: roster.allegiance}}})
    }

    const handleClickPrayersLore = () => {
        const lore = find(dataBase.data.lore, ['name', roster.prayersLore])
        const spells = filter(dataBase.data.lore_ability, ['loreId', lore.id])
        const data = {
            title: 'Prayers Lore',
            abilities: [{...lore, abilities: spells}]
        }
        navigate('/armyInfo', {state: {title: data.title, info: data, allegiance: {name: roster.allegiance}}})
    }

    const handleCloseModal = () => {
        setModalData({visible: false, title: '', text: ''})
    }

    const handleOpenModal = (title, type) => () => {
        const ability = find(dataBase.data.ability, ['name', title])
        setModalData({visible: true, title, ability})
    }

    const handleClickRegimentOfRenown = (regiment) => {
        navigate('/regimentOfRenown', {state: {title: regiment.name, regiment}})
    }

    const handleClickAuxiliaryUnit = (unit) => {
        navigate('/warscroll', {state: {title: unit.name, unit}})
    }

    const handleClickTacticCard = (cardName) => () => {
        const tacticCard = find(dataBase.data.rule_container, (card) => getStringAfterDash(card.title) === cardName)
        navigate('/tactic', {state: {title: cardName, tactic: tacticCard}})
    }

    const renderRegiment = (regiment, index) => <Regiment
        key={index}
        regiment={regiment}
        alliganceId={roster.allegianceId}
        index={index}
        isGeneral={index === roster.generalRegimentIndex}
        otherEnhancements={otherEnhancements}
        onOpenModal={handleOpenModal}
        isInfo
    />

    const renderManifestation = ({id}) => {
        const manifestation = find(dataBase.data.warscroll, ['id', id])
        return <Row
            key={manifestation.id}
            title={manifestation.name}
            image={manifestation.rowImage}
            navigateTo='warscroll'
            state={{unit: manifestation}}
        />
    }

    const renderRegimentOfRenown = () => <UnitRow
        unit={roster.regimentOfRenown}
        onClick={handleClickRegimentOfRenown}
        otherEnhancements={otherEnhancements}
        alliganceId={roster.alliganceId}
        isRegimentsOfRenown
        withoutMargin
        isInfo
    />

    // RoR с дп может брать артефакты и трейты
    const renderRegimentOfRenownUnit = (unit, index) => {
        const _unit = find(dataBase.data.warscroll, ['id', unit.id])
        return roster.regimentOfRenown.id === '11cc4585-4cf5-43eb-af29-e2cbcdb6f5dd'
            ? <UnitRow
                key={unit.id}
                unit={{..._unit, ...unit}}
                onClick={handleClickAuxiliaryUnit}
                otherEnhancements={otherEnhancements}
                onOpenModal={handleOpenModal}
                unitIndex={index}
                isRoRUnitWithKeyword
                withoutMargin
                isInfo
            />
            : <Row
                key={`${_unit.id}-${index}`}
                title={`${_unit.modelCount} ${_unit.name}`}
                image={_unit?.rowImage}
                navigateTo='warscroll'
                state={{unit: _unit}}
            />
    }

    const renderAuxiliaryUnit = (unit, index) => <UnitRow
        key={index}
        unit={unit}
        onClick={handleClickAuxiliaryUnit}
        unitIndex={index}
        alliganceId={roster.alliganceId}
        onOpenModal={handleOpenModal}
        otherEnhancements={otherEnhancements}
        withoutMargin
        isAuxiliary
        isInfo
    />

    const renderTerrain = () => {
        const terrain = find(dataBase.data.warscroll, ['name', roster.factionTerrain])
        return <UnitRow
            unit={terrain}
            onClick={handleClickAuxiliaryUnit}
            alliganceId={roster.alliganceId}
            withoutMargin
            isInfo
        />
    }
    if (!roster) {
        return null
    }

    const renderBattleTacticCard = (card, index) => {
        return <div id={Styles.block} onClick={handleClickTacticCard(card)}>
            <p id={Styles.text}>{index === 0 ? 'First' : 'Second'} Tactics Cards: {card}</p>
        </div>
    }

    return <div >
        <div id={Styles.block} onClick={handleClickAllegiance}>
            <p id={Styles.text}>Grand Alliance: {roster.grandAlliance}</p>
            <p id={Styles.text}>Allegiance: {roster.allegiance}</p>
            <p id={Styles.text}>Wounds: {info.wounds}</p>
            <p id={Styles.text}>Drops: {info.drops}</p>
            <p id={Styles.text}>Points: {roster.points?.all}/{roster.pointsLimit}</p>
        </div>
        <div id={Styles.block} onClick={handleClickFormation}>
            <p id={Styles.text}>Battle Formation: {roster.battleFormation}</p>
        </div>
        {map(roster.tactics, renderBattleTacticCard)}
        {roster.spellsLore
            ? <div id={Styles.block} onClick={handleClickSpellsLore}>
                <p id={Styles.text}>Spells Lore: {roster.spellsLore}</p>
            </div>
            : null
        }
        {roster.prayersLore
            ? <div id={Styles.block} onClick={handleClickPrayersLore}>
                <p id={Styles.text}>Prayers Lore: {roster.prayersLore}</p>
            </div>
            : null
        }
        {map(roster.regiments, renderRegiment)}
        {size(roster.auxiliaryUnits)
            ? <>
                <div id={Styles.block}>
                    <p id={Styles.text}>Auxiliary Units</p>
                </div>
                {map(roster.auxiliaryUnits, renderAuxiliaryUnit)}
            </>
            : null
        }
        {roster.regimentOfRenown
            ? <>
                <div id={Styles.block}>
                    <p id={Styles.text}>Regiment Of Renown</p>
                </div>
                {renderRegimentOfRenown()}
                {map(roster.regimentsOfRenownUnits, renderRegimentOfRenownUnit)}
            </>
            : null
        }
        {roster.manifestationLore
            ? <>
                <div id={Styles.block}>
                    <p id={Styles.text}>Manifestation Lore: {roster.manifestationLore}</p>
                </div>
                {map(roster.manifestationsList, renderManifestation)}
            </>
            : null
        }
        {roster.factionTerrain
            ? <>
                <div id={Styles.block}>
                    <p id={Styles.text}>Faction Terrain</p>
                </div>
                {renderTerrain()}
            </>
            : null
        }
        <Modal {...modalData} onClose={handleCloseModal} />
    </div>
}

export default Roster
