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

import Styles from './styles/UnitRow.module.css'

const dataBase = require('../dataBase.json')

const UnitRow = ({
    unit, unitIndex, regimentIndex, isAddUnit, onClick, onDelete, onCopy,onReinforced, artefacts, withoutMargin, onOpenModal,
    heroicTraits, withoutCopy, isAuxiliary, isGeneral, alliganceId, isRegimentsOfRenown, isRoRUnitWithKeyword, isInfo
}) => {
    const navigate = useNavigate()
    const isHero = unit.referenceKeywords?.includes('Hero') 
    const isShowEnhancements = isHero && !unit.referenceKeywords?.includes('Unique')
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
    let unitInfo = {}
    if (isInfo) {
        unitInfo = isRegimentsOfRenown
            ? find(dataBase.data.ability_group, ['id', unit.id])
            : find(dataBase.data.warscroll, ['id', unit.id])
        rowImage = unitInfo?.rowImage
    }

    const handleClick = () => {
        if (onClick) {
            onClick(isInfo ? unitInfo : unit)
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

    const renderChooseWeapon = () => <button id={Styles.chooseEnhancementButton} onClick={handleWeaponOption}>
        Weapon Options
    </button>

    const renderWeapon = (count, weapon) => <p id={Styles.weapon}>{count} x {weapon}</p>

    const renderWeaponOption = (weaponOption) => map(weaponOption, renderWeapon)

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
            {isAddUnit || unit.cannotBeReinforced || unit.abilityGroupType === 'regimentOfRenown' || isInfo
                ? null
                : unit.isReinforced
                    ? <button id={Styles.button} onClick={handleReinforced}><img src={Minus} alt="" /></button>
                    : <button id={Styles.button} onClick={handleReinforced}><img src={Plus} alt="" /></button>
            }
            {isAddUnit || isHero || withoutCopy || isAuxiliary || unit.onlyOne || isInfo
                ? null
                : <button id={Styles.button} onClick={handleCopy}><img src={Copy} alt="" /></button>
            }
            {onDelete && !isInfo ? <button id={Styles.button} onClick={handleDelete}><img src={Close} alt="" /></button> : null}
            {isAddUnit ? <button id={Styles.infoButton} onClick={handleClickInfo}><img src={Info} alt="" /></button> : null}
        </div>
        {isInfo
            ? <>
                {unit.artefact && <button id={Styles.infoEnhancementButton} onClick={onOpenModal(unit.artefact, 'artefact')}>
                    {`Artefact: ${unit.artefact}`}
                </button>}
                {unit.heroicTrait && <button id={Styles.infoEnhancementButton} onClick={onOpenModal(unit.heroicTrait, 'heroicTrait')}>
                    {`Heroic Trait: ${unit.heroicTrait}`}
                </button>}
                {unit.weaponOptions
                    ? map(unit.weaponOptions, renderWeaponOption)
                    : null
                }
                {unit['Ensorcelled Banners'] && <button id={Styles.infoEnhancementButton} onClick={onOpenModal(unit['Ensorcelled Banners'], 'ensorcelledBanners')}>
                    {`Ensorcelled Banners: ${unit['Ensorcelled Banners']}`}
                </button>}
                {unit['First Circle Titles'] && <button id={Styles.infoEnhancementButton} onClick={onOpenModal(unit['First Circle Titles'], 'firstCircleTitles')}>
                    {`First Circle Titles: ${unit['First Circle Titles']}`}
                </button>}
            </>
            : <>
                {isShowEnhancements && !isAddUnit
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
                {(optionGroups.length > 0 || additionalOption) && !isAddUnit
                    ? <div id={Styles.enhancementsContainer}>
                        {weaponOptions.length > 0 ? renderChooseWeapon() : null}
                        {marksOfChaos ? renderChooseOptionButton(marksOfChaos) : null}
                        {additionalOption ? renderAdditionalOption(additionalOption) : null}
                        {otherWarscrollOption ? renderChooseOptionButton(otherWarscrollOption) : null}
                    </div>
                    : null
                }
            </>
        }
    </div>
}

export default UnitRow