import React from 'react'
import {useLocation} from 'react-router-dom'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Constants from '../Constants'
import {roster, navigationState} from '../utilities/appState'
import {replaceAsterisks, getInfo, replaceQuotation, cleanBuilder} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'

import Styles from './styles/Army.module.css'

const dataBase = require('../dataBase.json')

const Army = () => {
    const {allegiance, isArmyOfRenown, allegianceId, grandAlliance} = useLocation().state
    let _allegiance = allegiance
    if (!allegiance) {
        _allegiance = find(dataBase.data.faction_keyword, faction => faction.id === allegianceId)
    }
    let items = [{title: 'Warscrolls', screen: 'units'}]
    let rosterOptions
    if (isArmyOfRenown) {
        const publications = filter(dataBase.data.publication,
            item => item.factionKeywordId === _allegiance.parentFactionKeywordId && includes(item.name, 'Army of Renown')
        )
        let publicationId
        if (publications.length > 1) {
            publicationId = find(publications, item => includes(item.name, replaceQuotation(_allegiance.name.split(" ")[0])))?.id
        } else {
            publicationId = publications[0]?.id
        }
        const ruleSectionId = find(dataBase.data.rule_section, item => item.publicationId === publicationId && item.displayOrder === 1)?.id
        const ruleContainerId = find(dataBase.data.rule_container, item => item.ruleSectionId === ruleSectionId)?.id
        const ruleContainerComponentId = find(dataBase.data.rule_container_component, item => item.ruleContainerId === ruleContainerId && item.contentType === 'bullets')?.id
        rosterOptions = filter(dataBase.data.bullet_point, item => item.ruleContainerComponentId === ruleContainerComponentId)
        rosterOptions.sort((a, b) => a.displayOrder - b.displayOrder)
    }
    let addendasId = ''
    // Достаем для джовсов addendasId
    if (_allegiance.id === '298391fb-3d74-4a26-b9cc-5f3ad5fe4852') {
        addendasId = '75bae3d0-2f58-491f-b11c-47d36eee796a'
    // Достаем для крулов addendasId
    } else if (_allegiance.id === '21ed7371-d9e3-4a05-8b2c-db46cee7d29d') {
        addendasId = '6bef51dd-844d-4cc1-b0d3-118c7c6af9a2'
    } else {
        addendasId = find(dataBase.data.publication, item => item.factionKeywordId === _allegiance.id && (includes(item.name, 'Faction Pack') || includes(item.name, 'Battletome')))?.id
    }
    const addendas =  find(dataBase.data.rule_section, item => item.publicationId === addendasId && !item.parentId)

    forEach(Constants.armyEnhancements, screen => {
        const info = getInfo(screen, _allegiance)
        if (info) {
            items.push(info)
        }
    })

    // otherEnhancements
    const otherEnhancement = find(dataBase.data.ability_group, (item) => item.factionId === _allegiance.id && item.abilityGroupType === 'otherEnhancements')
    if (otherEnhancement) {
        const enhancements = filter(dataBase.data.ability, (item) => item.abilityGroupId === otherEnhancement.id)
        if (enhancements.length > 0) {
            items.push({title: otherEnhancement.name, withoutTitle: true, restrictionText: otherEnhancement.restrictionText, abilities: enhancements})
        }
    }

    let armyOfRenown
    // Достаем для джовсов armyOfRenown
    if (_allegiance.id === '298391fb-3d74-4a26-b9cc-5f3ad5fe4852') {
        armyOfRenown = filter(dataBase.data.faction_keyword, (faction) => faction.id === 'f0198b42-f55e-4261-8443-083bb17ec9c8' || faction.id === '62cacaf1-c044-4338-9443-9ef762b1fe1f' || faction.id === '19121b3d-667c-4048-be52-90760f656b66')
    // Достаем для крулов armyOfRenown
    } else if (_allegiance.id === '21ed7371-d9e3-4a05-8b2c-db46cee7d29d') {
        armyOfRenown = filter(dataBase.data.faction_keyword, (faction) => faction.id === 'bccf5ba7-6c62-4e17-872a-3838888d2c8e' || faction.id === '19121b3d-667c-4048-be52-90760f656b66')
    } else {
        armyOfRenown = filter(dataBase.data.faction_keyword, (faction) => faction.parentFactionKeywordId === _allegiance.id)
    }

    const handleClickBuilder = () => {
        if (roster.allegianceId !== allegiance.id) {
            cleanBuilder()
            roster.allegiance = allegiance.name
            roster.allegianceId = allegiance.id
        }
        navigationState.isBuilder = true
    }

    const renderRow = (item) => <Row
        key={item.title}
        title={item.title}
        navigateTo={item.screen || 'armyInfo'}
        state={{allegiance: _allegiance, info: item}}
    />

    const renderBuilderRow = () => <Row
        title='Builder'
        navigateTo='builder'
        state={{alliganceId: _allegiance.id}}
        onClick={handleClickBuilder}
    />

    const renderAddendas = () => <Row
        title={addendas.name}
        navigateTo='ruleChapters'
        state={{chapter: addendas}}
    />

    const renderArmyOfRenown = (item) => <Row
        key={item.title}
        title={item.name}
        navigateTo='armyOfRenown'
        state={{allegiance: item, isArmyOfRenown: true, grandAlliance}}
    />

    const renderRosterOptions = (option) => <p id={Styles.rosterOptionText} key={option.id}>&#8226; {replaceAsterisks(option.text)}</p>

    return <>
        <HeaderImage src={_allegiance.rosterHeaderImage} alt={_allegiance.name} isWide />
        <div id='column' className='Chapter'>
            {items.map(renderRow)}
            {renderBuilderRow()}
            {addendas && renderAddendas()}
            {armyOfRenown.length > 0
                ? <div>
                    <p id={Styles.armyOfRenown}>Army of Renown</p>
                    {map(armyOfRenown, renderArmyOfRenown)}
                </div>
                : null
            }
            {isArmyOfRenown
                ? <>
                    <h4 id={Styles.rosterOption}>Roster Options</h4>
                    {map(rosterOptions, renderRosterOptions)}
                </>
                : null
            }
        </div>
    </>
}

export default Army