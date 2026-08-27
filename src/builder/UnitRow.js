import React from 'react'
import {useNavigate} from 'react-router-dom'
import RowImage from '../components/RowImage'
import Copy from '../icons/copy.svg'
import Close from '../icons/close.svg'
import Plus from '../icons/plus.svg'
import Minus from '../icons/minus.svg'
import DarkGeneral from '../icons/darkGeneral.svg'
import Info from '../icons/info.svg'
import {capitalizeFirstLetter, camelCaseToWords} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import every from 'lodash/every'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'

import Styles from './styles/UnitRow.module.css'

const dataBase = require('../dataBase.json')

const UnitRow = ({
    unit, unitIndex, regimentIndex, isAddUnit, onClick, onDelete, onCopy,onReinforced, artefacts, withoutMargin,
    heroicTraits, withoutCopy, isAuxiliary, isGeneral, alliganceId, isRegimentsOfRenown, isRoRUnitWithKeyword, otherEnhancements
}) => {
    const navigate = useNavigate()
    const isHero = unit?.referenceKeywords?.includes('Hero') 
    const isShowEnhancements = isHero && !unit?.referenceKeywords?.includes('Unique')
    const optionGroups = dataBase.data.option_group.filter(group => group.warscrollId === unit.id)
    const marksOfChaos = isRoRUnitWithKeyword ? undefined : optionGroups.find(group => group.optionGroupType === 'marksOfChaos')
    const otherWarscrollOption = optionGroups.find(group => group.optionGroupType === 'otherWarscrollOption')
    let additionalOption = dataBase.data.ability_group_required_warscroll.find(group => group.warscrollId === unit.id)?.abilityGroupId
    if (additionalOption) {
        additionalOption = dataBase.data.ability_group.find(group => group.id === additionalOption && group.factionId === alliganceId)
    }
    const weaponOptions = optionGroups.filter(group => group.optionGroupType === 'weapon')
    let rowImage = unit?.rowImage
    if (isRegimentsOfRenown) {
        rowImage = find(dataBase.data.warscroll, ['id', unit.regimentOfRenownRowImageWarscrollId])?.rowImage
    }
    let requiredOtherEnhancementKeywords = []
    let excludedOtherEnhancementKeywords = []
    let hiddenEnhancements = []
    if (size(otherEnhancements)) {
        forEach(otherEnhancements, otherEnhancement => {
            const requiredWarscrolls = filter(dataBase.data.ability_group_required_warscroll, ['abilityGroupId', otherEnhancement.id])
            if (size(requiredWarscrolls)) {
                const isShowEnhancement = Boolean(find(requiredWarscrolls, ['warscrollId', unit.id]))
                if (!isShowEnhancement) {
                    hiddenEnhancements.push(otherEnhancement.id)
                }
            }
            if (additionalOption && additionalOption.id === otherEnhancement.id) {
                hiddenEnhancements.push(otherEnhancement.id)
            }
            const requiredKeywordId = find(dataBase.data.ability_group_required_keyword, ['abilityGroupId', otherEnhancement.id])?.keywordId
            requiredOtherEnhancementKeywords.push(find(dataBase.data.keyword, ['id', requiredKeywordId])?.name)
            const excludedKeywords = filter(dataBase.data.ability_group_excluded_keyword, ['abilityGroupId', otherEnhancement.id])
            excludedOtherEnhancementKeywords.push(map(excludedKeywords, excludedKeyword => find(dataBase.data.keyword, ['id', excludedKeyword.keywordId])?.name))
        })
    }
    let isCogfort = false
    if (unit.id === '0c632405-8a16-4429-8437-11e6dfdcca1c' || unit.id === '9d0a2d00-22f4-49b3-9c66-af03cefb4b93') {
        isCogfort = true
    }

    const handleClick = () => {
        if (onClick) {
            onClick(unit)
        }
    }

    const handleDelete = () => {
        if (onDelete) {
            onDelete(unit, unitIndex)
        }
    }

    const handleCopy = () => {
        if (onCopy) {
            onCopy(unit)
        }
    }

    const handleReinforced = () => {
        if (onReinforced) {
            onReinforced(unit, unitIndex)
        }
    }

    const handleChooseEnhancement = (name, type) => () => {
        const data = type === 'artefact' ? artefacts : heroicTraits
        navigate('/chooseEnhancement', {state: {title: name, data, type, unitIndex, regimentIndex, isAuxiliary, isRoRUnitWithKeyword}})
    }

    const handleChooseAdditionalOption = (option) => () => {
        navigate('/chooseEnhancement', {state: {title: option.name, data: option, type: option.name, unitIndex, regimentIndex, isAuxiliary, isAdditionalOption: true}})
    }

    const handleChooseOption = (optionGroup) => () => {
        navigate('/chooseOption', {state: {title: camelCaseToWords(capitalizeFirstLetter(optionGroup.optionGroupType)), optionGroup, unitIndex, regimentIndex, isAuxiliary, isRoRUnitWithKeyword}})
    }

    const handleWeaponOption = () => {
        navigate('/chooseWeapon', {state: {
            title: 'Weapon Options',
            selectedWeaponOptions: unit.weaponOptions,
            weaponOptions,
            unitIndex,
            regimentIndex,
            isAuxiliary,
            isReinforced: unit.isReinforced
        }})
    }

    const handleClickInfo = () => {
        if (isRegimentsOfRenown) {
            navigate('/regimentOfRenown', {state: {title: unit.name, regiment: unit}})
        } else {
            navigate('/warscroll', {state: {title: unit.name, unit}})
        }
    }

    const renderChooseOptionButton = (option) => <button id={Styles.chooseEnhancementButton} onClick={handleChooseOption(option)}>
        {unit[option.optionGroupType]
            ? `${camelCaseToWords(option.optionGroupType)}: ${unit[option.optionGroupType]}`
            : `${camelCaseToWords(option.optionGroupType)}`
        }
    </button>

    const renderAdditionalOption = (option) => <button id={Styles.chooseEnhancementButton} onClick={handleChooseAdditionalOption(option)}>
        {unit[option.name]
            ? `${option.name}: ${unit[option.name]}`
            : `${option.name}`
        }
    </button>

    const renderOtherEnhancement = (otherEnhancement, index) => {
        if (
            otherEnhancement &&
            (requiredOtherEnhancementKeywords[index] ? includes(unit.referenceKeywords, requiredOtherEnhancementKeywords[index]) : true) &&
            (excludedOtherEnhancementKeywords[index] ? every(excludedOtherEnhancementKeywords[index], keyword => !includes(unit.referenceKeywords, keyword)) : true) &&
            !unit.referenceKeywords?.includes('Unique') &&
            !includes(hiddenEnhancements, otherEnhancement.id)
        ) {
            return renderAdditionalOption(otherEnhancement)
        } else if (isCogfort && otherEnhancement.name === 'Ironweld Innovations') {
            return renderAdditionalOption(otherEnhancement)
        } else {
            return null
        }
    }

    const renderChooseWeapon = () => <button id={Styles.chooseEnhancementButton} onClick={handleWeaponOption}>
        Weapon Options
    </button>

    return <div id={withoutMargin ? Styles.rorContainer : Styles.container}>
        <div className={Styles.row}>
            <button id={Styles.addUnitButton} onClick={handleClick}>
                {rowImage ? <RowImage src={rowImage} alt={unit.name} /> : null}
                <div id={Styles.addUnitButtonSubContainer}>
                    {isGeneral ? <img id={Styles.generalIcon} src={DarkGeneral} alt=''/> : null}
                    <p id={Styles.name}>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} ` : ''}{unit.name}</p>
                </div>
                <p id={Styles.price}>{unit.points || unit.regimentOfRenownPointsCost || 0} pts</p>
            </button>
            {isAddUnit || unit.cannotBeReinforced || unit.abilityGroupType === 'regimentOfRenown'
                ? null
                : unit.isReinforced
                    ? <button id={Styles.button} onClick={handleReinforced}><img src={Minus} alt="" /></button>
                    : <button id={Styles.button} onClick={handleReinforced}><img src={Plus} alt="" /></button>
            }
            {isAddUnit || isHero || withoutCopy || isAuxiliary || unit.onlyOne
                ? null
                : <button id={Styles.button} onClick={handleCopy}><img src={Copy} alt="" /></button>
            }
            {onDelete ? <button id={Styles.button} onClick={handleDelete}><img src={Close} alt="" /></button> : null}
            {isAddUnit ? <button id={Styles.infoButton} onClick={handleClickInfo}><img src={Info} alt="" /></button> : null}
        </div>
        {isShowEnhancements && !isAddUnit && !isCogfort
            ? <div id={Styles.enhancementsContainer}>
                <button id={Styles.chooseEnhancementButton} onClick={handleChooseEnhancement('Artefacts', 'artefact')}>
                    {unit.artefact ? `Artefact: ${unit.artefact}` : 'Сhoose Artefact'}
                </button>
                <button id={Styles.chooseEnhancementButton} onClick={handleChooseEnhancement('Heroic Traits', 'heroicTrait')}>
                    {unit.heroicTrait ? `Heroic Trait: ${unit.heroicTrait}` : 'Сhoose Heroic Trait'}
                </button>
            </div>
            : null
        }
        {(optionGroups.length > 0 || additionalOption || size(otherEnhancements)) && !isAddUnit
            ? <div id={Styles.enhancementsContainer}>
                {weaponOptions.length > 0 ? renderChooseWeapon() : null}
                {marksOfChaos ? renderChooseOptionButton(marksOfChaos) : null}
                {additionalOption ? renderAdditionalOption(additionalOption) : null}
                {otherWarscrollOption ? renderChooseOptionButton(otherWarscrollOption) : null}
                {map(otherEnhancements, renderOtherEnhancement)}
            </div>
            : null
        }
    </div>
}

export default UnitRow