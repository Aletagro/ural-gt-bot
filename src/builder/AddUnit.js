import React, {useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import {roster, builderFilters} from '../utilities/appState'
import {unitsSortesByType, sortByName} from '../utilities/utils'
import UnitRow from './UnitRow'
import Checkbox from '../components/Checkbox'
import Accordion from '../components/Accordion'

import find from 'lodash/find'
import filter from 'lodash/filter'
import uniqBy from 'lodash/uniqBy'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'

import Styles from './styles/AddUnit.module.css'

const dataBase = require('../dataBase.json')

const AddUnit = () => {
    window.scrollTo(0, 0)
    const navigate = useNavigate()
    const [hidePotentialLegends, setHidePotentialLegends] = useState(builderFilters.hidePotentialLegends)
    const [showLegends, setShowLegends] = useState(builderFilters.showLegends)
    const {alliganceId, heroId, regimentId, isAuxiliary, isRegimentsOfRenown} = useLocation().state
    const warscrollIds = dataBase.data.warscroll_faction_keyword.filter((item) => item.factionKeywordId === alliganceId).map(item => item.warscrollId)
    let units = []
    let hasPotentialLegends = false

    const hasKeyword = (unitKeywords, requiredKeywordsArray , excludedKeywords) => {
        let isHas = false
        requiredKeywordsArray.forEach((requiredKeywords, index) => {
            // Проверка, что все кейворды обязательные имеются
            const filtredKeywords = unitKeywords.filter(Keyword => requiredKeywords.find(requiredKeyword => requiredKeyword.id === Keyword.keywordId))
            if (requiredKeywords?.length === filtredKeywords?.length) {
                // Проверка, что нет исключающих кейвордов
                if (!unitKeywords.find(unitKeyword => {
                    return find(excludedKeywords[index], ['id', unitKeyword.keywordId])
                })) {
                    isHas = true
                }
            }
        })
        return isHas
    }

    const setHasPonentialLegends = (units) => {
        return units.find(unit => {
            if (unit?.notes) {
                return unit.notes.includes('Legends on')
            }
            return false
        })
    }

    const filterPonentialLegends = (units) => {
        return units.filter(unit => {
            if (unit?.notes) {
                return !unit.notes.includes('Legends on')
            }
            return true
        })
    }

    if (isRegimentsOfRenown) {
        const regimentsOfRenownKeywords = dataBase.data.ability_group_regiment_of_renown_permitted_faction_keyword.filter(keyword => keyword.factionKeywordId === alliganceId)
        units = regimentsOfRenownKeywords.map(keyword => dataBase.data.ability_group.find(group => group.id === keyword.abilityGroupId))
    } else if (isAuxiliary) {
        units = warscrollIds.map(warscrollId => dataBase.data.warscroll.find(scroll => scroll.id === warscrollId)).filter(unit => !unit.isSpearhead && (showLegends ?  true : !unit.isLegends) && unit.points)
        units = unitsSortesByType(units)
    } else if (heroId) {
        // определяем всех юнитов фракции
        const allUnits = warscrollIds.map(warscrollId => dataBase.data.warscroll.find(scroll => scroll.id === warscrollId)).filter(unit => !unit.isSpearhead && (showLegends ?  true : !unit.isLegends) && !includes(unit.referenceKeywords, 'Faction Terrain') && !includes(unit.referenceKeywords, 'Manifestation'))
        // определяем кейворды всех юнитов фракции
        const allUnitsKeywordsIds = allUnits.map(unit => dataBase.data.warscroll_keyword.filter(keyword => keyword.warscrollId === unit.id))
        // определяем опция реджимента героя
        const regimentOptions = dataBase.data.warscroll_regiment_option.filter(({warscrollId, requiredRosterFactionKeywordId}) => warscrollId === heroId && (requiredRosterFactionKeywordId ? requiredRosterFactionKeywordId === alliganceId : true))
        const regimentOptionsAny = regimentOptions.filter(option => option.childQuantity === 'any' && !option.requiredWarscrollId && (option.requiredFactionKeywordId !== '298391fb-3d74-4a26-b9cc-5f3ad5fe4852' || option.requiredFactionKeywordId !== '21ed7371-d9e3-4a05-8b2c-db46cee7d29d'))
        const regimentOptionsAnyWithRequiredWarscroll = regimentOptions.filter(option => option.childQuantity === 'any' && option.requiredWarscrollId)
        const regimentOptionsOne = regimentOptions.filter(option => option.childQuantity === 'one' || option.childQuantity === 'zeroToOne')
        const ironjawsOption = regimentOptions.find(option => option.requiredFactionKeywordId === '298391fb-3d74-4a26-b9cc-5f3ad5fe4852')
        const kruleboyzOption = regimentOptions.find(option => option.requiredFactionKeywordId === '21ed7371-d9e3-4a05-8b2c-db46cee7d29d')
        // ищем юнитов из опций с любым количеством
        if (regimentOptionsAny.length) {
            // находим кейворды обязательных опций
            const optionRequiredKeywords = regimentOptionsAny.map(({id}) => dataBase.data.warscroll_regiment_option_required_keyword.filter(({warscrollRegimentOptionId}) => warscrollRegimentOptionId === id))
            const requiredKeywords = optionRequiredKeywords.map(keywords => keywords.map(keyword => dataBase.data.keyword.find(({id}) => id === keyword?.keywordId)))
            // находим кейворды исключающих опций
            const optionExcludedKeywords = regimentOptionsAny.map(({id}) => dataBase.data.warscroll_regiment_option_excluded_keyword.filter(({warscrollRegimentOptionId}) => warscrollRegimentOptionId === id))
            const excludedKeywords = optionExcludedKeywords.map(keywords => keywords.map(keyword => dataBase.data.keyword.find(({id}) => id === keyword?.keywordId)))
            // ищем нужных нам юнитов
            const legalUnits = allUnitsKeywordsIds.filter(unitKeywordsIds => hasKeyword(unitKeywordsIds, requiredKeywords, excludedKeywords))
            const legalUnitsIds = legalUnits.map(unit => unit[0].warscrollId)
            units = legalUnitsIds.map(legalUnitsId => allUnits.find(unit => unit.id === legalUnitsId))
        }
        // ищем юнитов из опций с обязательным юнитом
        if (regimentOptionsAnyWithRequiredWarscroll.length) {
            regimentOptionsAnyWithRequiredWarscroll.forEach(option => {
                const warscroll = allUnits.find(warscroll => warscroll.id === option.requiredWarscrollId)
                if (warscroll) {
                    units.push(warscroll)
                }
            })
        }
        // ищем юнитов из опций с one и zeroToOne
        if (regimentOptionsOne.length) {
            const unitsInRegimentIds = roster.regiments[regimentId].units.map(unit => unit.id)
            unitsInRegimentIds.shift()
            const onlyOneIds = roster.regiments[regimentId].units.map(unit => unit.onlyOne).filter(Boolean)
            regimentOptionsOne.forEach(option => {
                if (!onlyOneIds.find(id => id === option.id)) {
                    let warscroll = {}
                    if (option.requiredWarscrollId) {
                        warscroll = allUnits.find(warscroll => warscroll.id === option.requiredWarscrollId && !unitsInRegimentIds.find(id => id === warscroll.id))
                        if (warscroll) {
                            units.push({...warscroll, onlyOne: true})
                        }
                    } else {
                        // находим кейворды обязательных опций
                        const requiredKeywordId = dataBase.data.warscroll_regiment_option_required_keyword.find(keyword => keyword.warscrollRegimentOptionId === option.id)?.keywordId
                        const warscrollIds = dataBase.data.warscroll_keyword.filter(warscrollKeyword => warscrollKeyword.keywordId === requiredKeywordId)
                        // находим кейворды исключающих опций
                        const excludedKeywordId = dataBase.data.warscroll_regiment_option_excluded_keyword.find(keyword => keyword.warscrollRegimentOptionId === option.id)?.keywordId
                        const excludedKeyword = dataBase.data.keyword.find(keyword => keyword.id === excludedKeywordId)?.name
                        const warscrolls = warscrollIds.map(({warscrollId}) => {
                            const _warscroll = allUnits.find(warscroll => warscroll.id === warscrollId &&
                                !unitsInRegimentIds.find(id => id === warscroll.id) &&
                                !warscroll.referenceKeywords.includes(excludedKeyword) &&
                                (warscroll.referenceKeywords.includes('Unique') ? warscroll.id !== heroId : true)
                            )
                            if (_warscroll) {
                                return {..._warscroll, onlyOne: option.id}
                            }
                            return null
                        }).filter(Boolean)
                        if (warscrolls.length) {
                            units = [...units, ...warscrolls]
                        }
                    }
                }
            })
        }
        if (ironjawsOption && !kruleboyzOption) {
            units = units.filter(unit => includes(unit.referenceKeywords, 'Ironjawz'))
        }
        if (kruleboyzOption && !ironjawsOption) {
            units = units.filter(unit => includes(unit.referenceKeywords, 'Kruleboyz'))
        }
        const uniqUnits = uniqBy(units, 'id')
        units = uniqUnits
        hasPotentialLegends = setHasPonentialLegends(units)
        if (hasPotentialLegends && hidePotentialLegends) {
            units = filterPonentialLegends(units)
        }
        units = unitsSortesByType(units)
    } else {
        units = warscrollIds.map(warscrollId => dataBase.data.warscroll.find(scroll => scroll.id === warscrollId)).filter(unit => !unit.isSpearhead && (showLegends ?  true : !unit.isLegends) && unit.referenceKeywords.includes('Hero') && !unit.requiredPrimaryHeroWarscrollId)
        // У АоРа The Magnate's Crew героем может быть Айронклад
        if (alliganceId === '09e28194-8a37-4c3b-aaa5-8aa38bcfd9ac') {
            const heroIronclad = find(dataBase.data.warscroll, ['id', '816d2c52-aacc-4f1d-bf50-320665911b97'])
            if (heroIronclad) {
                units.push(heroIronclad)
            }
        }
        // У АоРа The Clattering Procession героем может быть Black Coach
        if (alliganceId === '6f6c097c-91af-4684-a487-2e7402fdb990') {
            const heroBlackCoach = find(dataBase.data.warscroll, ['id', 'b6fbb49e-b0c7-417a-8a80-bb95dc344e4f'])
            if (heroBlackCoach) {
                units.push(heroBlackCoach)
            }
            const heroSoGBlackCoach = find(dataBase.data.warscroll, ['id', '5bedefb3-4a40-4b3a-9c9d-4e86d97d9c6f'])
            if (heroSoGBlackCoach) {
                units.push(heroSoGBlackCoach)
            }
        }
        hasPotentialLegends = setHasPonentialLegends(units)
        if (hasPotentialLegends && hidePotentialLegends) {
            units = filterPonentialLegends(units)
        }
        sortByName(units)
    }

    const handleClick = (unit) => {
        navigate(-1)
        if (isRegimentsOfRenown) {
            roster.regimentOfRenown = unit
            const regimentsOfRenownWarscrollsIds = filter(dataBase.data.ability_group_regiment_of_renown_linked_warscroll, ['abilityGroupId', unit.id])
            const regimentsOfRenownUnits = []
            forEach(regimentsOfRenownWarscrollsIds, item => {
                const warscroll = find(dataBase.data.warscroll, ['id', item.warscrollId])
                for (let i = item.instanceCount; i > 0; i--) {
                    regimentsOfRenownUnits.push(warscroll)
                }
            })
            roster.regimentsOfRenownUnits = regimentsOfRenownUnits
        } else if (isAuxiliary) {
            roster.auxiliaryUnits.push(unit)
        } else {
            let newRegiment = {...roster.regiments[regimentId]}
            newRegiment.units = [...roster.regiments[regimentId]?.units, unit]
            newRegiment.points = newRegiment.points + unit.points
            if (!heroId) {
                newRegiment.heroId = unit.id
                // Проверка есть ли у героя привязанные к нему юниты
                const requiredHeroUnits = dataBase.data.warscroll.filter(scroll => scroll.requiredPrimaryHeroWarscrollId === unit.id && !scroll.isSpearhead && (showLegends ?  true : !scroll.isLegends))
                if (requiredHeroUnits?.length > 0) {
                    newRegiment.units = [...newRegiment.units, ...requiredHeroUnits]
                }
            }
            roster.regiments[regimentId] = newRegiment
        }
        roster.points.all += unit.points || unit.regimentOfRenownPointsCost || 0
    }

    const handleChangeHidePotentialLegends = () => {
        setHidePotentialLegends(!hidePotentialLegends)
        builderFilters.hidePotentialLegends = !hidePotentialLegends
    }

    const handleChangeShowLegends = () => {
        setShowLegends(!showLegends)
        builderFilters.showLegends = !showLegends
    }

    const renderRow = (unit) => <UnitRow key={unit?.id} unit={unit} onClick={handleClick} isAddUnit isRegimentsOfRenown={isRegimentsOfRenown}/>

    const renderUnitsType = (type) => <Accordion
        title={type.title}
        data={type.units}
        renderItem={renderRow}
    />

    return <div id='column' className='Chapter'>
        {hasPotentialLegends
            ? <div id={Styles.potentialLegendsContainer} onClick={handleChangeHidePotentialLegends}>
                <p id={Styles.potentialLegends}>Hide Potential Legends</p>
                <Checkbox onClick={handleChangeHidePotentialLegends} checked={hidePotentialLegends} />
            </div>
            : null
        }
        <div id={Styles.potentialLegendsContainer} onClick={handleChangeShowLegends}>
            <p id={Styles.potentialLegends}>Show Legends</p>
            <Checkbox onClick={handleChangeShowLegends} checked={showLegends} />
        </div>
        {heroId || isAuxiliary
            ? units.map(renderUnitsType)
            : units.map(renderRow)
        }
    </div>
}

export default AddUnit