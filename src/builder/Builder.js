import React, {useCallback, useReducer, useState, useEffect} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import Modal from '../components/Modal'
import Button from '../components/Button'
import {Facts, Fact, Group, SummaryCard, Stat} from '../components/RosterParts'
import Constants from '../Constants'
import {roster} from '../utilities/appState'
import {getWoundsCount, getInfo, setRosterGrandAlliance, isScourgeOfGhyran} from '../utilities/utils'
import Regiment from './Regiment'
import UnitRow from './UnitRow'
import Row from '../components/Row'

import map from 'lodash/map'
import size from 'lodash/size'
import find from 'lodash/find'
import filter from 'lodash/filter'
import flatten from 'lodash/flatten'
import forEach from 'lodash/forEach'
import isEmpty from 'lodash/isEmpty'

import Styles from './styles/Builder.module.css'

const dataBase = require('../dataBase.json')

const spellsIncludesTexts = ['Lore of', 'Spell Lore', 'Arcane']
const spellsExcludedTexts = ['Lore of the Abyss', 'Lore of Virulence', 'Lore of the Spirit-Song', 'Lore of the Everwinter', "Brodd's Bellows"]
const preyersIncludesTexts = ['Prayer', 'Bless', 'Rites', 'Warbeats', 'Scriptures', 'Benedictions', 'Gifts', 'Lore of Virulence', 'Lore of the Spirit-Song', 'Proclamations', 'Lore of the Everwinter', "Brodd's Bellows"]
const pointsLimits = ['1000', '1500', '2000', '2500', '3000']

const emptyRegiment = {
    units: [],
    heroId: '',
    points: 0
}

const Builder = () => {
    const {allegiance, alliganceId} = useLocation().state
    const [open, setOpen] = useState(false)
    const [pointError, setPointError] = useState(false)
    const _alliganceId = alliganceId || allegiance?.id
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const warscrollIds = dataBase.data.warscroll_faction_keyword.filter((item) => item.factionKeywordId === _alliganceId).map(item => item.warscrollId)
    const factionTerrains = warscrollIds.map(warscrollId => dataBase.data.warscroll.find(scroll => scroll.id === warscrollId)).filter(unit => !unit.isSpearhead && !unit.isLegends && unit?.referenceKeywords?.includes('Terrain'))
    const lores = dataBase.data.lore.filter(lore => lore.factionId === _alliganceId && !isScourgeOfGhyran(lore.publicationId))
    const spellsLores = []
    const preyersLores = []
    const manifestationsLores = dataBase.data.lore.filter(lore => lore.factionId === null)
    const canCreateNewRegiment = size(roster.regiments) + (roster.regimentOfRenown ? 1 : 0) < 5
    lores.forEach(lore => {
        if (spellsIncludesTexts.find(text => lore.name.includes(text)) && isEmpty(filter(spellsExcludedTexts, text => lore.name.includes(text)))) {
            spellsLores.push(lore)
        } else if (preyersIncludesTexts.find(text => lore.name.includes(text))) {
            preyersLores.push(lore)
        } else {
            manifestationsLores.unshift(lore)
        }
    })
    const artefactsGroups = dataBase.data.ability_group.filter(group => group.factionId === _alliganceId && group.abilityGroupType === 'artefactsOfPower')
    const artefacts = flatten(map(artefactsGroups, artefactsGroup => dataBase.data.ability.filter(ability => ability.abilityGroupId === artefactsGroup?.id && !isScourgeOfGhyran(ability.abilityGroupId, false, true))))
    const heroicTraitsGroups = dataBase.data.ability_group.filter(group => group.factionId === _alliganceId && group.abilityGroupType === 'heroicTraits')
    const heroicTraits = flatten(map(heroicTraitsGroups, heroicTraitsGroup => dataBase.data.ability.filter(ability => ability.abilityGroupId === heroicTraitsGroup?.id && !isScourgeOfGhyran(ability.abilityGroupId, false, true))))
    const battleFormations = dataBase.data.battle_formation.filter(formation => formation.factionId === _alliganceId && !isScourgeOfGhyran(formation.publicationId))
    const otherEnhancementsGroups = filter(dataBase.data.ability_group, (item) =>
        item.factionId === _alliganceId &&
        item.abilityGroupType === 'otherEnhancements' &&
        !isScourgeOfGhyran(item.id, false, true)
    )
    let otherEnhancements = []
    if (size(otherEnhancementsGroups)) {
        roster.otherEnhancements = []
        forEach(otherEnhancementsGroups, otherEnhancementsGroup => {
            const abilities = filter(dataBase.data.ability, ['abilityGroupId', otherEnhancementsGroup.id])
            otherEnhancements.push({name: otherEnhancementsGroup?.name, id: otherEnhancementsGroup?.id, abilities})
            roster.otherEnhancements.push(otherEnhancementsGroup?.name)
        })
    }
    if (spellsLores.length === 1 && !roster.spellsLore) {
        roster.spellsLore = spellsLores[0].name
    }
    if (preyersLores.length === 1 && !roster.prayersLore) {
        roster.prayersLore = preyersLores[0].name
    }
    if (manifestationsLores.length === 1 && !roster.manifestationLore) {
        roster.manifestationLore = manifestationsLores[0].name
    }
    if (factionTerrains.length === 1 && !roster.factionTerrain && !factionTerrains[0].points) {
        roster.factionTerrain = factionTerrains[0].name
        roster.points.terrain = factionTerrains[0].points
        roster.points.all += factionTerrains[0].points
    }
    if (!battleFormations.length) {
        roster.withoutBattleFormation = true
    }
    const requiredGeneralIds = filter(dataBase.data.roster_faction_keyword_required_general_warscroll, ['factionKeywordId', _alliganceId])
    if (size(requiredGeneralIds) === 1) {
        roster.requiredGeneral = find(dataBase.data.warscroll, ['id', requiredGeneralIds[0].warscrollId])
    }
    roster.requiredUnitsIds = map(filter(dataBase.data.roster_faction_keyword_required_warscroll, ['factionKeywordId', _alliganceId]), 'warscrollId')
    if (!roster.grandAlliance) {
        setRosterGrandAlliance(roster.allegiance)
    }

    useEffect(() => {
        let hasError = false
        if (roster.pointsLimit - roster.points.all < 0) {
            hasError = true
        }
        if (hasError !== pointError) {
            setPointError(hasError)
        }
    // eslint-disable-next-line
    }, [roster.points.all])

    const handleAddRegiment = useCallback(() => {
        roster.regiments = [...roster.regiments, emptyRegiment]
        forceUpdate()
    }, [])

    const handleClickAuxiliaryUnit = (unit) => {
        navigate('/warscroll', {state: {title: unit.name, unit}})
    }

    const handleClickRegimentOfRenown = (regiment) => {
        navigate('/regimentOfRenown', {state: {title: regiment.name, regiment}})
    }

    const handleDeleteAuxiliaryUnit = (unit, index) => {
        roster.auxiliaryUnits.splice(index, 1)
        roster.points.all -= unit.points
        forceUpdate()
    }

    const handleDeleteRegimentOfRenown = (regiment, index) => {
        roster.regimentOfRenown = null
        roster.regimentsOfRenownUnits = []
        roster.points.all -= regiment.regimentOfRenownPointsCost
        forceUpdate()
    }

    const handleAddAuxiliaryUnit = () => {
        navigate('/addUnit', {state: {
            isAuxiliary: true,
            alliganceId: _alliganceId,
            title: 'Add Auxiliary Unit'
        }})
    }

    const handleAddRegimentsOfRenown = () => {
        navigate('/addUnit', {state: {
            isRegimentsOfRenown: true,
            alliganceId: _alliganceId,
            title: 'Add Regiments Of Renown'
        }})
    }

    const handleChooseEnhancement = (name, type, data, isInfo) => () => {
        if (type === 'factionTerrain' && isInfo) {
            const terrain = data.find(terrain => terrain.name === roster.factionTerrain)
            navigate('/warscroll', {state: {unit: terrain, title: terrain.name}})
        } else {
            navigate('/chooseEnhancement', {state: {title: name, data, type, isRosterInfo: true, isInfo}})
        }
    }

    const handleChooseTactics = () => {
        navigate('/builderChooseTacticsCard', {state: {title: 'Choose Tactics Card'}})
    }

    const handleReinforcedAuxiliary = (unit, unitIndex) => {
        if (unit.isReinforced) {
            const _points = unit.points / 2
            roster.auxiliaryUnits[unitIndex] = {
                ...roster.auxiliaryUnits[unitIndex],
                isReinforced: false,
                points: _points
            }
            roster.points.all -= _points
        } else {
            roster.auxiliaryUnits[unitIndex] = {
                ...roster.auxiliaryUnits[unitIndex],
                isReinforced: true,
                points: unit.points * 2
            }
            roster.points.all += unit.points
        }
        forceUpdate()
    }

    const handleClickAllegiance = () => {
        const info = getInfo(Constants.armyEnhancements[0], {id: _alliganceId, name: roster.allegiance})
        navigate('/armyInfo', {state: {title: Constants.armyEnhancements[0].title, info, allegiance: {name: roster.allegiance}}})
    }

    const handleOpenModal = () => {setOpen(true)}

    const handleCloseModal = () => {setOpen(false)}

    const handleClickPointsLimitButton = (limit) => () => {
        roster.pointsLimit = limit
        handleCloseModal()
    }

    const handleClickTactics = (card) => () => {
        navigate('/tactic', {state: {title: card.name, tactic: card}})
    }

    const renderRegiment = (regiment, index) => <Regiment
        key={index}
        regiment={regiment}
        alliganceId={_alliganceId}
        index={index}
        forceUpdate={forceUpdate}
        artefacts={artefacts}
        heroicTraits={heroicTraits}
        otherEnhancements={otherEnhancements}
    />

    const renderAuxiliaryUnit = (unit, index) => <UnitRow
        key={index}
        unit={unit}
        onClick={handleClickAuxiliaryUnit}
        onDelete={handleDeleteAuxiliaryUnit}
        unitIndex={index}
        artefacts={artefacts}
        heroicTraits={heroicTraits}
        onReinforced={handleReinforcedAuxiliary}
        alliganceId={_alliganceId}
        withoutMargin
        isAuxiliary
        otherEnhancements={otherEnhancements}
    />

    const renderRegimentOfRenown = () => <UnitRow
        unit={roster.regimentOfRenown}
        onClick={handleClickRegimentOfRenown}
        onDelete={handleDeleteRegimentOfRenown}
        alliganceId={_alliganceId}
        withoutMargin
        withoutCopy
    />

    // RoR с дп может брать артефакты и трейты
    const renderRegimentOfRenownUnit = (unit, index) => roster.regimentOfRenown.id === '11cc4585-4cf5-43eb-af29-e2cbcdb6f5dd'
        ? <UnitRow
            key={unit.id}
            unit={unit}
            onClick={handleClickAuxiliaryUnit}
            unitIndex={index}
            artefacts={artefacts}
            heroicTraits={heroicTraits}
            isRoRUnitWithKeyword
            withoutMargin
            withoutCopy
        />
        : <Row
            key={`${unit.id}-${index}`}
            title={`${unit.modelCount} ${unit.name}`}
            image={unit?.rowImage}
            navigateTo='warscroll'
            state={{unit}}
            card
        />

    const renderManifestation = (manifestation) => <Row
        key={manifestation.id}
        title={manifestation.name}
        image={manifestation.rowImage}
        navigateTo='warscroll'
        state={{unit: manifestation, allegianceId: _alliganceId}}
        card
    />

    const renderEnhancementPoints = (type) => {
        switch (type) {
            case 'manifestationLore':
                return roster.points?.manifestations ? ` (${roster.points?.manifestations}${Constants.noBreakSpace}pts)` : ''
            case 'factionTerrain':
                return roster.points?.terrain ? ` (${roster.points?.terrain}${Constants.noBreakSpace}pts)` : ''
            case 'spellsLore':
                return roster.points?.spellsLore ? ` (${roster.points?.spellsLore}${Constants.noBreakSpace}pts)` : ''
            case 'prayersLore':
                return roster.points?.prayersLore ? ` (${roster.points?.prayersLore}${Constants.noBreakSpace}pts)` : ''
            default:
                return ''
        }
    }

    const renderEnhancement = (name, type, data) => {
        if (data.length === 1 && !data[0].points) {
            return <Fact
                label={name}
                value={`${data[0].name}${renderEnhancementPoints(type)}`}
                onClick={handleChooseEnhancement(name, type, data, true)}
            />
        }
        const chosen = roster[type]
        return <Fact
            label={name}
            value={chosen ? `${chosen}${renderEnhancementPoints(type)}` : `Choose ${name}`}
            isEmpty={!chosen}
            onClick={handleChooseEnhancement(name, type, data)}
            onInfo={type !== 'manifestationLore' && chosen ? handleChooseEnhancement(name, type, data, true) : undefined}
        />
    }

    const renderPointsLimitButton = (limit) => <Button
        key={limit}
        className={Styles.limitButton}
        type={Number(roster.pointsLimit) === Number(limit) ? 'primary' : 'soft'}
        onClick={handleClickPointsLimitButton(limit)}
    >
        {limit} Points
    </Button>

    const renderModalContent = () => <>{pointsLimits.map(renderPointsLimitButton)}</>

    const tacticsChosen = size(roster.tactics) === 2
    const hasLores = spellsLores.length > 0 || preyersLores.length > 0 || manifestationsLores.length > 0 || factionTerrains.length > 0

    return <div id='column' className='Chapter'>
        <SummaryCard alliance={roster.grandAlliance} army={roster.allegiance} onClick={handleClickAllegiance}>
            <Stat label='Points' value={`${roster.points?.all}/${roster.pointsLimit}`} onClick={handleOpenModal} />
            <Stat label='Left' value={roster.pointsLimit - roster.points?.all} isOver={pointError} />
            <Stat label='Wounds' value={getWoundsCount(roster)} />
        </SummaryCard>
        <Facts>
            {battleFormations.length
                ? <Fact
                    label='Battle Formation'
                    value={roster.battleFormation
                        ? `${roster.battleFormation}${roster.points?.battleFormation ? ` (${roster.points?.battleFormation}${Constants.noBreakSpace}pts)` : ''}`
                        : 'Choose Battle Formation'
                    }
                    isEmpty={!roster.battleFormation}
                    onClick={handleChooseEnhancement('Battle Formation', 'battleFormation', battleFormations)}
                />
                : null
            }
            <Fact
                label='Tactics Cards'
                value={tacticsChosen ? 'Your Tactics Cards' : 'Choose Tactics Cards'}
                isEmpty={!tacticsChosen}
                onClick={handleChooseTactics}
            />
            {roster.tactics[0] ? <Fact label='First Card' value={roster.tactics[0].name} onClick={handleClickTactics(roster.tactics[0])} /> : null}
            {roster.tactics[1] ? <Fact label='Second Card' value={roster.tactics[1].name} onClick={handleClickTactics(roster.tactics[1])} /> : null}
        </Facts>
        {map(roster.regiments, renderRegiment)}
        {canCreateNewRegiment
            ? <Button className={Styles.addButton} onClick={handleAddRegiment}>Add Regiment</Button>
            : null
        }
        {size(roster.auxiliaryUnits)
            ? <Group title='Auxiliary Units'>
                {roster.auxiliaryUnits.map(renderAuxiliaryUnit)}
            </Group>
            : null
        }
        <Button className={Styles.addButton} type='secondary' onClick={handleAddAuxiliaryUnit}>Add Auxiliary Unit</Button>
        {roster.regimentOfRenown
            ? <Group title='Regiment Of Renown'>
                {renderRegimentOfRenown()}
                {roster.regimentsOfRenownUnits?.map(renderRegimentOfRenownUnit)}
            </Group>
            : canCreateNewRegiment
                ? <Button className={Styles.addButton} type='secondary' onClick={handleAddRegimentsOfRenown}>Add Regiments Of Renown</Button>
                : null
        }
        {hasLores
            ? <Group title='Lores'>
                <Facts>
                    {spellsLores.length > 0 ? renderEnhancement('Spell Lore', 'spellsLore', spellsLores) : null}
                    {preyersLores.length > 0 ? renderEnhancement('Prayer Lore', 'prayersLore', preyersLores) : null}
                    {manifestationsLores.length > 0 ? renderEnhancement('Manifestation Lore', 'manifestationLore', manifestationsLores) : null}
                    {factionTerrains.length > 0 ? renderEnhancement('Faction Terrain', 'factionTerrain', factionTerrains) : null}
                </Facts>
            </Group>
            : null
        }
        {size(roster.manifestationsList)
            ? <Group title='Manifestations' subtitle={roster.manifestationLore}>
                {roster.manifestationsList.map(renderManifestation)}
            </Group>
            : null
        }
        <Modal visible={open} title='Points Limit' onClose={handleCloseModal} Content={renderModalContent} />
    </div>
}

export default Builder
