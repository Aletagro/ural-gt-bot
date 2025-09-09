import parse from 'html-react-parser'
import Constants from '../Constants'
import {roster} from '../utilities/appState'

import map from 'lodash/map'
import get from 'lodash/get'
import size from 'lodash/size'
import find from 'lodash/find'
import last from 'lodash/last'
import uniq from 'lodash/uniq'
import split from 'lodash/split'
import filter from 'lodash/filter'
import indexOf from 'lodash/indexOf'
import forEach from 'lodash/forEach'
import replace from 'lodash/replace'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'
import startsWith from 'lodash/startsWith'

const dataBase = require('../dataBase.json')

export const sortByName = (array, param) => param
    ? array.sort((a,b) => (a[param] > b[param]) ? 1 : ((b[param] > a[param]) ? -1 : 0))
    : array.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

export const unitsSortesByType = (units) => {
    const getUnitsByType = (type) => {
        const _units = filter(units, unit => includes(unit?.referenceKeywords, type.name) && (type.withoutHero ? !includes(unit.referenceKeywords, 'Hero') : true) && (type.name === 'Manifestation' ? true : !includes(unit.referenceKeywords, 'Manifestation')))
        if (_units.length > 0) {
            sortByName(_units)
            return {units: _units, title: replace(type.name, /,/g, '')}
        } else {
            return null
        }
    }
    return filter(map(Constants.unitsTypes, getUnitsByType), Boolean)
}

export const regimentSortesByGrandAlliances = (regiments) => {
    const getRegimentByGrandAlliances = (grandAlliance) => {
        const _regiments = filter(regiments, regiment => includes(regiment.keywords, grandAlliance.name))
        if (_regiments.length > 0) {
            sortByName(_regiments)
            return {regiments: _regiments, title: grandAlliance.name}
        } else {
            return null
        }
    }
    return filter(map(Constants.grandAlliances, getRegimentByGrandAlliances), Boolean)
}

export const getErrors = (roster) => {
    const errors = []
    if (!roster) {
        return errors
    }
    if (roster.points.all > roster.pointsLimit) {
        errors.push(`You use more than ${roster.pointsLimit} points`)
    }
    if (!roster.battleFormation  && !roster.withoutBattleFormation) {
        errors.push('Choose Battle Formation')
    }
    if (roster.generalRegimentIndex === null) {
        errors.push('Choose General')
    }
    if (size(roster.tactics) !== 2) {
        errors.push(`Choose 2 Battle Tactics Cards (now selected ${size(roster.tactics)})`)
    }
    const uniqueUnits = []
    let heroicTraitsCount = 0
    let atrefactsCount = 0
    let otherEnhancementCounts = size(roster.otherEnhancements) ? Array(size(roster.otherEnhancements)).fill(0) : []
    let hasWarmasterInRegiments = []
    let hasRequiredGeneral = false
    let isRequiredGeneralIsGeneral = false
    let jawsCount = 0
    let krulsCount = 0
    let mightyLordCount = 0
    let isMightyLordGeneral = false
    const unitsNames = []
    let requiredUnitsIds = []
    let hasBrokkGrungsson = false
    let heroIroncladsCount = 0
    forEach(roster.regiments, (regiment, index) => {
        if (index === roster.generalRegimentIndex && regiment.units.length > 5) {
            errors.push("In General's Regiment you have more than 4 units")
        } else if (index !== roster.generalRegimentIndex && regiment.units.length > 4){
            errors.push(`In Regiment ${index + 1} you have more than 3 units`)
        }
        regiment.units.forEach(unit => {
            if (!includes(unitsNames, unit.name)) {
                unitsNames.push(unit.name)
            }
            if (includes(unit.referenceKeywords, 'Unique')) {
                uniqueUnits.push(unit.name)
            }
            if (unit.heroicTrait) {
                heroicTraitsCount += 1
            }
            if (unit.artefact) {
                atrefactsCount += 1
            }
            forEach(roster.otherEnhancements, (otherEnhancement, index) => {
                if (unit[otherEnhancement]) {
                    otherEnhancementCounts[index] += 1
                }
            })
            if (unit.points * 2 > roster.pointsLimit) {
                errors.push(`${unit.name} cost more than half the army`)
            }
            if (includes(unit.referenceKeywords, 'Warmaster')) {
                hasWarmasterInRegiments.push(index)
            }
            if (roster.requiredGeneral && unit.id === roster.requiredGeneral.id) {
                hasRequiredGeneral = true
                if (index === roster.generalRegimentIndex) {
                    isRequiredGeneralIsGeneral = true
                }
            }
            if (unit.id === '53b0c49a-b6ca-4e71-b97f-9d397e6b8bb9' || unit.id === '6f1cebd9-3584-4bd1-b9f7-3b19ced3708e') {
                mightyLordCount += 1
                if (roster.generalRegimentIndex === index) {
                    isMightyLordGeneral = true
                }
            }
            if (unit.id === '816d2c52-aacc-4f1d-bf50-320665911b97') {
                heroIroncladsCount += 1
            }
            if (unit.id === '8ac98757-e26f-44a3-a880-afa9856b5abc') {
                hasBrokkGrungsson = true
            }
            if (includes(roster.requiredUnitsIds, unit.id)) {
                requiredUnitsIds.push(unit.id)
            }
        })
        if (roster.allegiance === 'Big Waaagh!') {
            if (get(regiment, 'units[0].name', '') === 'Kragnos, the End of Empire') {
            } else if (includes(get(regiment, 'units[0].referenceKeywords', ''), 'Ironjawz')) {
                jawsCount = jawsCount + 1
            } else if (includes(get(regiment, 'units[0].referenceKeywords', ''), 'Kruleboyz')) {
                krulsCount = krulsCount + 1
            }
        }
    })
    // RoR с дп может брать артефакты и трейты
    if (roster.regimentOfRenown?.id === '11cc4585-4cf5-43eb-af29-e2cbcdb6f5dd') {
        roster.regimentsOfRenownUnits.forEach((unit) => {
            if (unit.heroicTrait) {
                heroicTraitsCount += 1
            }
            if (unit.artefact) {
                atrefactsCount += 1
            }
        })
    }
    if (heroicTraitsCount > 1) {
        errors.push(`You have ${heroicTraitsCount} Heroic Traits`)
    }
    if (atrefactsCount > 1) {
        errors.push(`You have ${atrefactsCount} Atrefacts`)
    }
    forEach(roster.otherEnhancements, (otherEnhancement, index) => {
        if (otherEnhancementCounts[index] > (otherEnhancement === 'First Circle Titles' ? 3 : 1)) {
            errors.push(`You have ${otherEnhancementCounts[index]} ${otherEnhancement}`)
        }
    })
    if (hasWarmasterInRegiments.length && !includes(hasWarmasterInRegiments, roster.generalRegimentIndex) && !roster.requiredGeneral) {
        errors.push("You have a Warmaster hero, but he isn't your general")
    }
    if (roster.requiredGeneral) {
        if (!hasRequiredGeneral) {
            errors.push(`You must be included ${roster.requiredGeneral.name} in your roster`)
        }
        if (!isRequiredGeneralIsGeneral) {
            errors.push(`${roster.requiredGeneral.name} must be your general`)
        }
    }
    forEach(roster.auxiliaryUnits, unit => {
        if (!includes(unitsNames, unit.name)) {
            unitsNames.push(unit.name)
        }
        if (includes(unit.referenceKeywords, 'Unique')) {
            uniqueUnits.push(unit.name)
        }
        if (includes(roster.requiredUnitsIds, unit.id)) {
            requiredUnitsIds.push(unit.id)
        }
        if (unit.id === '816d2c52-aacc-4f1d-bf50-320665911b97') {
            heroIroncladsCount += 1
        }
        if (unit.id === '8ac98757-e26f-44a3-a880-afa9856b5abc') {
            hasBrokkGrungsson = true
        }
    })
    forEach(unitsNames, unitsName => {
        if (startsWith(unitsName, 'Scourge of Ghyran ')) {
            const nameWithoutPrefix = unitsName.slice('Scourge of Ghyran '.length)
            if (includes(unitsNames, nameWithoutPrefix)) {
                errors.push(`You can't have ${nameWithoutPrefix} and ${unitsName} in your army at the same time`)
            }
        }
    })
    const duplicateUniqueUnits = filter(uniqueUnits, (unit, index, units) => {
        return indexOf(units, unit) !== index;
    })
    forEach(duplicateUniqueUnits, unit => {
        errors.push(`You have more then one ${unit}`)
    })
    if (jawsCount !== krulsCount) {
        errors.push('For every regiment led by a Kruleboyz Hero you must also include regiment led by a Ironjawz Hero')
    }
    // Gorechosen Champions могут иметь только одного майти лорда
    if (mightyLordCount && roster.allegianceId === 'a5b5e8cd-458f-47bc-b6ea-15c71311ecd5') {
        if (mightyLordCount > 1) {
            errors.push('Gorechosen Champions can only have one Mighty Lord of Khorne')
        }
        if (!isMightyLordGeneral) {
            errors.push('Mighty Lord of Khorne must be your general')
        }
    }
    if (size(roster.requiredUnitsIds)) {
        requiredUnitsIds = uniq(requiredUnitsIds)
        const filteredRequiredUnitsIds = filter(roster.requiredUnitsIds, requiredUnitsId => !includes(requiredUnitsIds, requiredUnitsId))
        forEach(filteredRequiredUnitsIds, requiredUnitsId => {
            const unitName = find(dataBase.data.warscroll, ['id', requiredUnitsId])?.name
            if (unitName) {
                errors.push(`You must be included ${unitName} in your roster`)
            }
        })
    }
    // В АоРе The Magnate's Crew нельзя иметь Брокка и геройский Айронклад одновременно. И всего один геройскйи Айронклад
    if (roster.allegianceId === '09e28194-8a37-4c3b-aaa5-8aa38bcfd9ac') {
        if (heroIroncladsCount > 1) {
            errors.push('You can only have 1 Arkanaut Ironclad (Hero) in your army')
        }
        if (heroIroncladsCount && hasBrokkGrungsson) {
            errors.push('You cannot include Brokk Grungsson and Arkanaut Ironclad (Hero) in the same army')
        }
    }
    return errors
}

export const getWarnings = (roster) => {
    const warnings = []
    if (!roster) {
        return warnings
    }
    if (!roster.manifestationLore) {
        let hasWizard = false
        forEach(roster.regiments, (regiment, index) => {
            forEach(regiment.units, unit => {
                if (includes(unit.referenceKeywords, 'Wizard')) {
                    hasWizard = true
                }
            })
        })
        forEach(roster.auxiliaryUnits, unit => {
            if (includes(unit.referenceKeywords, 'Wizard')) {
                hasWizard = true
            }
        })
        if(find(Constants.regimentOfRenownsWithWizard, regimentOfRenown => regimentOfRenown?.id === roster.regimentOfRenown?.id)) {
            hasWizard = true
        }
        if (hasWizard) {
            warnings.push('Choose Manifestations Lore')
        }
    }
    if (roster.allegiance === 'Ogor Mawtribes' && !roster.factionTerrain) {
        warnings.push('Choose Faction Terrain')
    }
    if (roster.allegiance === 'Disciples of Tzeentch' && !roster.spellsLore) {
        warnings.push('Choose Spells Lore')
    }
    let hasLegends = false
    forEach(roster.regiments, (regiment) => {
        forEach(regiment.units, unit => {
            if (unit.isLegends) {
                hasLegends = true
            }
        })
    })
    if (hasLegends) {
        warnings.push('You have Legends Unit in your Army')
    }
    return warnings
}

export const getAvToDice = (count) => {
    const arr = [...Array(count+1).keys()]
    let sum = 0
    forEach(arr, number => sum = sum + number)
    return sum / count
}

export const getValue = (value) => {
    if (Number(value)) {
        return value
    }
    const splitedValue = lowerCase(value).split('d')
    if (splitedValue.length === 2) {
        let average
        if (Number(splitedValue[1])) {
            average = getAvToDice(Number(splitedValue[1]))
        } else {
            const valueAfterD = filter(splitedValue[1].split(''), item => item.trim())
            if (Number(valueAfterD[0])) {
                average = getAvToDice(Number(valueAfterD[0]))
            } else {
                return undefined
            }
            return average * (Number(splitedValue[0]) || 1) + Number(valueAfterD[1])
        }
        if (splitedValue[0]) {
            return average * Number(splitedValue[0])
        } else {
            return average
        }
    }
}

export const capitalizeFirstLetter = (text) => {
    return String(text).charAt(0).toUpperCase() + String(text).slice(1);
}

export const camelCaseToWords = (text) => {
    if (text) {
        const result = text.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
    return text
}

export const getWoundsCount = (roster) => {
    let woundsCount = 0
    forEach(roster.regiments, regiment => {
        forEach(regiment.units, unit => {
            woundsCount = woundsCount + (unit.modelCount * (unit.isReinforced ? 2 : 1) * unit.health)
        })
    })
    if (roster.auxiliaryUnits.length > 0) {
        forEach(roster.auxiliaryUnits, unit => {
            woundsCount = woundsCount + (unit.modelCount * (unit.isReinforced ? 2 : 1) * unit.health)
        })
    }
    if (roster.regimentOfRenown) {
        forEach(roster.regimentsOfRenownUnits, unit => {
            woundsCount = woundsCount + (unit.modelCount * (unit.isReinforced ? 2 : 1) * unit.health)
        })
    }
    return woundsCount
}

export const replaceAsterisks = (string) => {
    if (string) {
        let newString = replace(string, /(\*\*\*(.*?)\*\*\*)|(\*\*(.*?)\*\*)|(\*(.*?)\*)/g, (match, p1, p2, p3, p4, p5, p6) => {
            if (p1) {
                return `<b><i>${p2}</i></b>`;
            } else if (p3) {
                return `<b>${p4}</b>`;
            } else if (p5) {
                return `<i>${p6}</i>`;
            }
            return match; // На случай, если ничего не подошло
        });
        if (includes(newString, '<')) {
            return parse(newString)
        } else {
            return string
        }
    }
    return string
}

export const removeAsterisks = (string) => replace(string, /\*/g, '')

export const replaceQuotation = (string) => replace(string, '’', "'")

export const randomFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

export const getScoreParams = (battleplan) => {
    const data = find(Constants.battleplans, _battleplan => _battleplan.id === battleplan.id)
    if (data.maxForObjectives) {
        return {score: [...data.scoreParams], maxForObjectives: data.maxForObjectives}
    } else {
        return {score: data.scoreParams}
    }
}

export const getNewRound = (battleplan) => {
    const newRound = {
        firstPlayer: {
            tactics: {name: '', id: ''},
            vp: 0,
            objectiveVp: 0,
            ...getScoreParams(battleplan)
        },
        secondPlayer: {
            tactics: {name: '', id: ''},
            vp: 0,
            objectiveVp: 0,
            ...getScoreParams(battleplan)
        }
    }
    return newRound
}

export const getInfo = (screen, allegiance) => {
    let abilitiesGroup = dataBase.data[screen.groupName].filter((item) => 
        item.factionId === allegiance.id &&
        item.abilityGroupType === screen.abilityGroupType &&
        (screen.includesTexts
            ? Boolean(screen.includesTexts.find(text => item.name.includes(text)))
            : true
        ) &&
        (screen.excludedTexts
            ? Boolean(screen.excludedTexts.find(text => !item.name.includes(text)))
            : true
        )
    )
    if (screen.abilityGroupType === 'battleTraits') {
        abilitiesGroup = size(abilitiesGroup) === 1 ? abilitiesGroup : filter(abilitiesGroup, item => item.restrictionText)
    }
    const abilitiesRules = abilitiesGroup.map(formation => dataBase.data[screen.ruleName].filter((item) => item[screen.ruleIdName] === formation?.id))
    const abilities = abilitiesGroup.map((formation, index) => {
        return {name: formation?.name, id: formation?.id, points: formation?.points || 0, abilities: abilitiesRules[index]}
    })
    if (abilities.length > 0) {
        return {title: screen.title, abilities}
    } else {
        return null
    }
}

export const getCalcUnit = (unit) => {
    if (unit) {
        const weapons = unit.weapons.map(getCalcWeapon)
        return {name: unit.name, weapons}
    }
    const _unit = {
        name: '',
        weapons:  [{critOn: {modificator: 1, title: '6+'}}]
    }
    return _unit
}

export const getCalcWeapon = (weapon) => {
    if (weapon) {
        return {...weapon}
    }
    return {critOn: {modificator: 1, title: '6+'}}
}

const hasKeyword = (unitKeywords, requiredKeywords , excludedKeywords) => {
    let isHas = false
    // Проверка, что все кейворды обязательные имеются
    const filtredKeywords = unitKeywords.filter(Keyword => requiredKeywords.find(requiredKeyword => requiredKeyword.id === Keyword.keywordId))
    if (requiredKeywords?.length === filtredKeywords?.length) {
        // Проверка, что нет исключающих кейвордов
        if (!unitKeywords.find(unitKeyword => {
            return find(excludedKeywords, ['id', unitKeyword.keywordId])
        })) {
            isHas = true
        }
    }
    return isHas
}

export const getRegimentOption = (option, unit) => {
    const publicationId = find(dataBase.data.warscroll_publication, ['warscrollId', unit.id])?.publicationId
    let alliganceId = find(dataBase.data.publication, ['id', publicationId])?.factionKeywordId
    if (includes(unit.referenceKeywords, 'Ironjawz')) {
        alliganceId = '298391fb-3d74-4a26-b9cc-5f3ad5fe4852'
    } else if (includes(unit.referenceKeywords, 'Kruleboyz')) {
        alliganceId = '21ed7371-d9e3-4a05-8b2c-db46cee7d29d'
    }
    const warscrollIds = dataBase.data.warscroll_faction_keyword.filter((item) => item.factionKeywordId === alliganceId).map(item => item.warscrollId)
    // определяем всех юнитов фракции
    const allUnits = warscrollIds.map(warscrollId => dataBase.data.warscroll.find(scroll => scroll.id === warscrollId)).filter(unit => !unit.isSpearhead && !unit.isLegends && !includes(unit.referenceKeywords, 'Faction Terrain') && !includes(unit.referenceKeywords, 'Manifestation'))
    // определяем кейворды всех юнитов фракции
    const allUnitsKeywordsIds = allUnits.map(unit => dataBase.data.warscroll_keyword.filter(keyword => keyword.warscrollId === unit.id))
    let units = []
    if (option.childQuantity === 'any') {
        if (option.requiredWarscrollId) {
                const requiredUnit = allUnits.find(warscroll => warscroll.id === option.requiredWarscrollId)
                if (requiredUnit) {
                    return {
                        screen: 'warscroll',
                        title: requiredUnit.name,
                        data: {unit: requiredUnit}
                    }
                }
        } else {
            // находим кейворды обязательных опций
            const optionRequiredKeywords = dataBase.data.warscroll_regiment_option_required_keyword.filter(({warscrollRegimentOptionId}) => warscrollRegimentOptionId === option.id)
            const requiredKeywords = optionRequiredKeywords.map(keyword => dataBase.data.keyword.find(({id}) => id === keyword?.keywordId))
            // // находим кейворды исключающих опций
            const optionExcludedKeywords = dataBase.data.warscroll_regiment_option_excluded_keyword.filter(({warscrollRegimentOptionId}) => warscrollRegimentOptionId === option.id)
            const excludedKeywords = optionExcludedKeywords.map(keyword => dataBase.data.keyword.find(({id}) => id === keyword?.keywordId))
            // // ищем нужных нам юнитов
            const legalUnits = allUnitsKeywordsIds.filter(unitKeywordsIds => hasKeyword(unitKeywordsIds, requiredKeywords, excludedKeywords))
            const legalUnitsIds = legalUnits.map(unit => unit[0].warscrollId)
            units = legalUnitsIds.map(legalUnitsId => allUnits.find(unit => unit.id === legalUnitsId))
        }
    }  else if (option.childQuantity === 'zeroToOne' || option.childQuantity === 'one') {
        if (option.requiredWarscrollId) {
            const requiredUnit = allUnits.find(warscroll => warscroll.id === option.requiredWarscrollId)
            if (requiredUnit) {
                return {
                    screen: 'warscroll',
                    title: requiredUnit.name,
                    data: {unit: requiredUnit}
                }
            }
        } else {
            // находим кейворды обязательных опций
            const requiredKeywordId = dataBase.data.warscroll_regiment_option_required_keyword.find(keyword => keyword.warscrollRegimentOptionId === option.id)?.keywordId
            const warscrollIds =  dataBase.data.warscroll_keyword.filter(warscrollKeyword => warscrollKeyword.keywordId === requiredKeywordId)
            // находим кейворды исключающих опций
            const excludedKeywordId = dataBase.data.warscroll_regiment_option_excluded_keyword.find(keyword => keyword.warscrollRegimentOptionId === option.id)?.keywordId
            const excludedKeyword =  dataBase.data.keyword.find(keyword => keyword.id === excludedKeywordId)?.name
            const warscrolls = warscrollIds.map(({warscrollId}) => {
                const _warscroll = allUnits.find(warscroll => warscroll.id === warscrollId && !warscroll.referenceKeywords.includes(excludedKeyword))
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
    if (size(units)) {
        return {
            screen: 'units',
            title: 'Units',
            data: {units}
        }
    }
    return {}
}

export const cleanBuilder = () => {
    roster.id = undefined
    roster.allegiance = ''
    roster.allegianceId = ''
    roster.auxiliaryUnits = []
    roster.battleFormation = ''
    roster.factionTerrain = ''
    roster.generalRegimentIndex = null
    roster.grandAlliance = ''
    roster.manifestationLore = ''
    roster.manifestationsList = []
    roster.points = {all: 0}
    roster.pointsLimit = 2000
    roster.prayersLore = ''
    roster.regimentOfRenown = null
    roster.regiments = [{units: [], heroId: '', points: 0}]
    roster.regimentsOfRenownUnits = []
    roster.requiredGeneral = null
    roster.spellsLore = ''
    roster.tactics = []
    roster.isPublic = true
    roster.note = ''
    roster.listName = ''
    roster.withoutBattleFormation = false
    roster.otherEnhancements = []
}

export const getStringAfterDash = (text) => {
    const match = text.match(/ - (.+)/)
    return match ? match[1] : text
}

export const setRosterGrandAlliance = (allegiance) => {
    let grandAlliance = 'Order'
    if (includes(Constants.chaosFaction, allegiance)) {
        grandAlliance = 'Chaos'
    } else if (includes(Constants.deathFaction, allegiance)) {
        grandAlliance = 'Death'
    } else if (includes(Constants.destructionFaction, allegiance)) {
        grandAlliance = 'Destruction'
    }
    roster.grandAlliance = grandAlliance
}

export const cleanObject = (object) => {  
    for (let key in object) {
      if (object[key] === '' || object[key] === null || object[key] === undefined) {
        delete object[key]
      }
    }  
    return object
}

export const getTextAfter = (searchIn, searchFor, before = false, nextLine = false) => {
    // Используем indexOf для поиска индекса начала искомой строки
    const index = searchIn.indexOf(searchFor)
    // Если строка не найдена — возвращаем null
    if (index === -1) {
        return null
    }
    if (before) {
        // Возвращаем то, что до searchFor
        const lineStart = searchIn.lastIndexOf('\n', index) + 1
        const lineContentBefore = searchIn.slice(lineStart, index).trim()
        return lineContentBefore
    } else {
        // Возвращаем то, что после searchFor
        const startIndex = index + searchFor.length
        if (nextLine) {
            // Находим конец текущей строки
            const lineEnd = searchIn.indexOf('\n', startIndex);
            if (lineEnd === -1) return null;
            
            // Находим начало следующей строки
            const nextLineStart = lineEnd + 1;
            const nextLineEnd = searchIn.indexOf('\n', nextLineStart);
            const endIndex = nextLineEnd === -1 ? searchIn.length : nextLineEnd;
            
            return searchIn.slice(nextLineStart, endIndex).trim();
        } else {
            const endIndex = searchIn.indexOf('\n', startIndex)
            const endOfString = endIndex === -1 ? searchIn.length : endIndex
            return searchIn.slice(startIndex, endOfString).trim()
        }
    }
}

export const parseRegiments = (input) => {
    const lines = input.split('\n')
    const regiments = []
    const auxiliaryUnits = []
    const regimentOfRenown = {name: '', units: []}
    let currentRegiment = null
    let generalIndex = null
    let isAuxiliaryUnits = false
    let isRegimentOfRenown = false
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Начало РоРа
        if (line.startsWith('Regiment Of Renown')) {
            isRegimentOfRenown = true
            regimentOfRenown.name = split(lines[i + 1], ' (')[0].trim()
        }
        // Начало нового реджимента
        else if (line.startsWith('Regiment')) {
            const match = line.match(/Regiment (\d+)/);
            if (match) {
                const index = parseInt(match[1], 10) - 1; // отсчёт с 0
                currentRegiment = [];
                regiments[index] = currentRegiment; // сохраняем по индексу
                // Проверяем, есть ли "General's regiment" в следующей строке
                if (i + 1 < lines.length && lines[i + 1].trim() === "General's regiment") {
                    generalIndex = index;
                }
            }
        }
        // Начало Auxiliary юнитов
        if (line.startsWith('Auxiliary Units')) {
            isAuxiliaryUnits = true
            isRegimentOfRenown = false
        }
        // Юнит: начинается с числа и "x"
        else if (/^\d+ x/.test(line)) {
            const unit = {weapons: []};
            const modelCountMatch = line.match(/^(\d+) x/);
            const nameMatch = line.match(/\d+\sx\s(.+?)(?:\s*\(\d+\s*points?\))?$/);
            const pointsMatch = line.match(/\((\d+)\s*points?\)/);
    
            unit.modelCount = parseInt(modelCountMatch[1], 10);
            unit.name = nameMatch ? nameMatch[1].trim() : '';
            unit.points = pointsMatch ? parseInt(pointsMatch[1], 10) : 0;
            if (isRegimentOfRenown) {
                regimentOfRenown.units.push(unit)
            } else if (isAuxiliaryUnits) {
                auxiliaryUnits.push(unit)
            } else {
                currentRegiment.push(unit)
            }
        }
        // Улучшения: [Type]: Value
        else if (line.startsWith('[')) {
            const propMatch = line.match(/^\[(.+?)\]:\s*(.+)$/);
            if (propMatch && currentRegiment && currentRegiment.length > 0) {
            const lastUnit = isRegimentOfRenown
                ? regimentOfRenown.units[regimentOfRenown.units.length - 1]
                : isAuxiliaryUnits
                    ? auxiliaryUnits[auxiliaryUnits.length - 1]
                    : currentRegiment[currentRegiment.length - 1];
            const key = propMatch[1].trim();
            const value = propMatch[2].trim();
            lastUnit[key] = value;
            }
        }
        // Выбранное оружие юнита
        else if (line.startsWith('• ')) {
            const lastUnit = isRegimentOfRenown
                ? regimentOfRenown.units[regimentOfRenown.units.length - 1]
                : isAuxiliaryUnits
                    ? auxiliaryUnits[auxiliaryUnits.length - 1]
                    : currentRegiment[currentRegiment.length - 1];
            lastUnit.weapons.push(line.replace('• ', ''))
        }
    }
    return {generalIndex, regiments, auxiliaryUnits, regimentOfRenown}
}

export const parseRegimentsForWHAoS = (input) => {
    const lines = input.split('\n')
    const regiments = []
    const auxiliaryUnits = []
    const regimentOfRenown = {name: '', units: []}
    let currentRegiment = null
    let generalIndex = null
    let isAuxiliaryUnits = false
    let isRegimentOfRenown = false
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Начало РоРа
        if (line.startsWith('Regiments of Renown')) {
            isRegimentOfRenown = true
            regimentOfRenown.name = split(lines[i + 1], ' (')[0].trim()
        }
        // Начало нового реджимента
        else if (line.startsWith('Regiment') || line === "General's Regiment") {
            const match = line.match(/Regiment (\d+)/)
            if (match) {
            }
            const index = match ? parseInt(match[1], 10) : 0 // Генеральский реджимент всегда выводиться первым
            currentRegiment = [];
            regiments[index] = currentRegiment; // сохраняем по индексу
            // Генеральскй реджимент
            if (line === "General's Regiment") {
                generalIndex = index
            }
        }
        // Начало Auxiliary юнитов
        if (line.startsWith('Auxiliary Units')) {
            isAuxiliaryUnits = true
            isRegimentOfRenown = false
        }
        // Юнит: строка содержит цену в скобках
        else if (/\(\d+\)$/.test(line)) {
            const unit = {enhancements: [], weapons: []};
            const nameMatch = line.match(/^(.+?)\s*\(\d+\)$/);
            const pointsMatch = line.match(/\((\d+)\)$/);
    
            unit.name = nameMatch ? nameMatch[1].trim() : '';
            unit.points = pointsMatch ? parseInt(pointsMatch[1], 10) : 0;
            if (isRegimentOfRenown) {
                regimentOfRenown.units.push(unit)
            } else if (isAuxiliaryUnits) {
                auxiliaryUnits.push(unit)
            } else {
                currentRegiment.push(unit)
            }
        }
        // Улучшения
        else if (line.startsWith('• ')) {
            const value = line.replace('• ', '')
            if (!['Reinforced', 'General'].includes(value)) {
                const lastUnit = isRegimentOfRenown
                    ? regimentOfRenown.units[regimentOfRenown.units.length - 1]
                    : isAuxiliaryUnits
                        ? auxiliaryUnits[auxiliaryUnits.length - 1]
                        : currentRegiment[currentRegiment.length - 1]
                // Проверяем оружие это или энчант
                if (/^\d/.test(value.trim())) {
                    lastUnit.weapons.push(value)
                } else {
                    lastUnit.enhancements.push(value)
                }
            }
        }
    }
    return {generalIndex, regiments, auxiliaryUnits, regimentOfRenown}
}

export const getFactionForWHAoS = (text) => {
    // Регулярное выражение для поиска шаблона "часть1 | часть2 | часть3"
    const regex = /^([^|\n]+)\s*\|\s*([^|\n]+)\s*\|\s*([^|\n]+)$/m;
    const lines = text.split('\n');
    
    for (const line of lines) {
        const match = line.trim().match(regex);
        if (match) {
            // Возвращаем части без лишних пробелов
            return [match[1].trim(), match[2].trim(), match[3].trim()];
        }
    }
    
    return null; // Если ничего не найдено
}

export const findCommonOptionId = (arrays) => {
    if (arrays.length === 0) return null
    // Создаем Set из optionId первого подмассива
    let commonOptions = new Set(arrays[0].map(item => item.optionId))
    // Пересекаем с optionId остальных подмассивов
    for (let i = 1; i < arrays.length; i++) {
        const currentOptions = new Set(arrays[i].map(item => item.optionId))
        commonOptions = new Set([...commonOptions].filter(option => currentOptions.has(option)))
        // Если нет общих элементов, возвращаем null
        if (commonOptions.size === 0) return null
    }
    // Возвращаем первый найденный общий optionId
    return commonOptions.values().next().value
}

export const parseListForListbot = (input) => {
    const lines = input.split('\n')
    let regiments = [[]]
    const meta = []
    let currentRegimentIndex = 0
    let factionTerrain = ''
    let generalIndex = null
    let isMetaCollected = true
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (isMetaCollected) {
            // Если встретили строку с юнитом, прекращаем сбор меты
            if (/^.+\s\(\d+\)$/.test(line)) {
                isMetaCollected = false
            // Ищем текст в квадратных скобках
            } else if (line.startsWith('[')) {
                const match = line.match(/^\[([^\]]+)\]$/)
                if (match) {
                    meta.push(match[1])
                }
            }
        }
        // сделано так, а не через if else, потому что в ифе выше может isMetaCollected изменится
        if (!isMetaCollected) {
            if (/\(\d+\)$/.test(line)) {
                const unit = {enhancements: []};
                const modelCountMatch = line.match(/^-\s(\d+)\sx/);
                let nameMatch = line.match(/-\s\d+\sx\s(.+?)\s*(?:\(\d+\s*points?\)|\(\d+\))\s*$/);
                const pointsMatch = line.match(/\((\d+)\)$/);
                
                if (modelCountMatch) {
                    unit.modelCount = parseInt(modelCountMatch[1], 10);
                } else {
                    unit.modelCount = 1
                }
                if (!nameMatch) {
                    nameMatch = line.match(/^(.+?)\s*\(\d+\)$/)
                }
                unit.name = nameMatch ? nameMatch[1].trim() : '';
                unit.points = pointsMatch ? parseInt(pointsMatch[1], 10) : 0;
                regiments[currentRegimentIndex].push(unit)
            } else if (!line) {
                currentRegimentIndex ++
                regiments[currentRegimentIndex] = []
            } else if (line.startsWith('[')) {
                const enhancement = replace(line, /\[|\]/g, '')
                if (enhancement === 'General') {
                    generalIndex = currentRegimentIndex
                } else {
                    const lastUnit = last(regiments[currentRegimentIndex])
                    lastUnit.enhancements.push(enhancement)
                }
            } else if (/^[^(]+\(\d+pts\)$/.test(line)) {
                const match = line.trim().match(/^([^(]+)\(\d+pts\)$/)
                if (match) {
                    factionTerrain = match[1].trim()
                }
            }
        }
    }
    regiments = filter(regiments, regiment => size(regiment))
    return {generalIndex, regiments, meta, factionTerrain}
}

export const setTournamentStatus = (isRoundActive, round) => {
    if (isRoundActive) {
        return round === 0
            ? 'Турнир еще не начался'
            : `Идёт ${round} раунд`
    }
    switch (round) {
        case 0:
            return 'Турнир еще не начался'
        case 1:
            return 'Обед'
        case 2:
            return 'Перерыв'
        case 3:
            return 'Первый день закончился'
        case 4:
            return 'Обед и идет Голосование за Покрас'
        case 5:
            return 'Турнир окончен'
        default:
            return 'Перерыв'
    }
}

export const getUnitsRowRightText = (unit) => {
    const isManifestation = includes(unit.referenceKeywords, 'Manifestation')
    if (isManifestation) {
        const manifestationInfo = find(dataBase.data.lore_ability, ability => ability.linkedWarscrollId === unit.id)
        if (manifestationInfo) {
            return `${manifestationInfo.castingValue}+/${unit.control}`
        }
    }
    return unit?.points ? `${unit?.points} pts` : undefined
}