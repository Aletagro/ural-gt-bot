import React, {useState, useReducer} from 'react'
import useDebounce from '../utilities/useDebounce'
import {sortByName} from '../utilities/utils'
import {search} from '../utilities/appState'
import Constants from '../Constants'
import Row from '../components/Row'
import Accordion from '../components/Accordion'
import Ability from '../components/Ability'

import map from 'lodash/map'
import size from 'lodash/size'
import find from 'lodash/find'
import filter from 'lodash/filter'
import uniqBy from 'lodash/uniqBy'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Search.module.css'

const dataBase = require('../dataBase.json')

const Search = () => {
    const [value, setValue] = useState(search.value)
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    useDebounce(() => {
        if (value) {
            const warscrolls = filter(dataBase.data.warscroll, (warscroll) => !warscroll.isSpearhead && includes(lowerCase(warscroll.name), lowerCase(value)))
            search.Warscrolls = sortByName(warscrolls.splice(0, 20))
            const ruleTitles = filter(dataBase.data.rule_container, (rule) => includes(lowerCase(rule.title), lowerCase(value)))
            const inTexts = filter(dataBase.data.rule_container_component, (rule) => rule.contentType === 'text' && includes(lowerCase(rule.textContent), lowerCase(value)))
            const inTextRule = map(inTexts, rule => find(dataBase.data.rule_container, ['id', rule.ruleContainerId]))
            const rules = uniqBy(filter(sortByName([...ruleTitles, ...inTextRule], 'title'), ['isHiddenFromSearch', false]), 'id')
            const onlyСurrentRules = filter(rules, rule => {
                const ruleSection = find(dataBase.data.rule_section, ['id', rule.ruleSectionId])
                if (ruleSection) {
                    return !includes(Constants.hideChaptersIds, ruleSection.publicationId)
                }
                return true
            })
            search.Rules = onlyСurrentRules.splice(0, 40)
            const allegiances = filter(dataBase.data.faction_keyword, (faction) => includes(lowerCase(faction.name), lowerCase(value)) && faction.name !== 'Orruk Warclans')
            search.Allegiances = sortByName(allegiances.splice(0, 20))
            const battleFormation = filter(dataBase.data.battle_formation_rule, (rule) => includes(lowerCase(rule.name), lowerCase(value)))
            search['Battle Formation'] = sortByName(battleFormation.splice(0, 20))
            const abilities = filter(dataBase.data.ability, (ability) => includes(lowerCase(ability.name), lowerCase(value)))
            search.Abilities = sortByName(abilities.splice(0, 20))
            const loreAbility = filter(dataBase.data.lore_ability, (ability) => includes(lowerCase(ability.name), lowerCase(value)))
            search['Lore Abilities'] = sortByName(loreAbility.splice(0, 20))
            const ror = filter(dataBase.data.ability_group, (ability) => ability.abilityGroupType === 'regimentOfRenown' && includes(lowerCase(ability.name), lowerCase(value)))
            search['Regiment of Renown'] = sortByName(ror.splice(0, 20))
        } else {
            search.Warscrolls = []
            search.Rules = []
            search.Allegiances = []
            search['Battle Formation'] = []
            search.Abilities = []
            search['Lore Abilities'] = []
            search['Regiment of Renown'] = []
        }
        forceUpdate()
      }, [value], 300
    )

    const handleChange = (e) => {
        search.value = e.target.value
        setValue(e.target.value)
    }

    const handleChangeExpand = (e) => {
        const type = e.nativeEvent.target?.innerText
        search.expand[type] = !search.expand[type]
        forceUpdate()
    }

    const renderWarscroll = (unit) => <Row
        key={unit.id}
        title={unit.name}
        rightText={unit?.points ? `${unit?.points} pts` : undefined}
        image={unit?.rowImage}
        navigateTo='warscroll'
        state={{unit}}
    />

    const renderRule = (rule, index) => <Row
        key={index}
        title={rule.title}
        subtitle={rule.updateType}
        navigateTo='rules'
        state={{rules: [rule]}}
    />

    const renderRoR = (regiment) => <Row
        key={regiment.id}
        title={regiment.name}
        navigateTo='regimentOfRenown'
        state={{regiment}}
    />

    const renderAllegiance = (allegiance) => <Row
        key={allegiance.id}
        title={allegiance.name}
        navigateTo='army'
        state={{allegiance}}
    />

    const renderAbility = (ability) =>
        <Ability key={ability.id} ability={ability} />

    const renderAccordion = (type, renderItem) => <Accordion
        key={type}
        title={type}
        data={search[type]}
        renderItem={renderItem}
        expanded={search.expand[type]}
        onChangeExpand={handleChangeExpand}
    />

    return <>
        <div id={Styles.container}>
            <input id={Styles.input} onChange={handleChange} autoFocus placeholder='Start Typing' type='search' name='search' size={40} />
        </div>
        <div id='column' className='Chapter'>
            {size(search.Warscrolls) ? renderAccordion('Warscrolls', renderWarscroll) : null}
            {size(search.Rules) ? renderAccordion('Rules', renderRule) : null}
            {size(search.Allegiances) ? renderAccordion('Allegiances', renderAllegiance) : null}
            {size(search['Battle Formation']) ? renderAccordion('Battle Formation', renderAbility) : null}
            {size(search.Abilities) ? renderAccordion('Abilities', renderAbility) : null}
            {size(search['Lore Abilities']) ? renderAccordion('Lore Abilities', renderAbility) : null}
            {size(search['Regiment of Renown']) ? renderAccordion('Regiment of Renown', renderRoR) : null}
        </div>
    </>
}

export default Search