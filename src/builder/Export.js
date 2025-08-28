import React, {useState, useReducer, useCallback} from 'react'
import {ToastContainer, toast} from 'react-toastify'
import {useNavigate} from 'react-router-dom'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import 'react-toastify/dist/ReactToastify.css'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Checkbox from '../components/Checkbox'
import Constants from '../Constants'
import {roster, player, lists, meta} from '../utilities/appState'
import {getErrors, getWarnings, getWoundsCount, cleanObject, cleanBuilder} from '../utilities/utils'
import Close from '../icons/close.svg'

import map from 'lodash/map'
import get from 'lodash/get'
import size from 'lodash/size'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'

import Styles from './styles/Export.module.css'

const tg = window.Telegram.WebApp

const rorKeys =  ['id', 'name', 'regimentOfRenownPointsCost']

const manifistationsKeys =  ['id', 'name']

const Export = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [isCopy, setIsCopy] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [listName, setListName] = useState(roster.listName || `List-${lists.count + 1}`)
    const [isListPublic, setIsListPublic] = useState(true)
    const errors = getErrors(roster)
    const warnings = getWarnings(roster)
    const wounds = getWoundsCount(roster)
    const drops = roster.regiments.length + roster.auxiliaryUnits.length + (roster.regimentOfRenown ? 1 : 0)
    const user = tg.initDataUnsafe?.user
    const disableButton = Boolean(errors.length || warnings.length)
    const navigate = useNavigate()
    const unitsKeys =  ['id', 'name', 'points', 'modelCount', 'isReinforced', 'heroicTrait', 'artefact', 'otherWarscrollOption', 'marksOfChaos', ...roster.otherEnhancements, 'weaponOptions'] 

    const getUniques = () => {
        let uniqueUnits = ''
        forEach(roster.regiments, (regiment, index) => {
            regiment.units.forEach(unit => {
                if (includes(unit.referenceKeywords, 'Unique')) {
                    uniqueUnits = uniqueUnits ? `${uniqueUnits}, ${unit.name}` : unit.name
                }
            })
        })
        return uniqueUnits
    }

    const additionalUnitOptions = ['artefact', 'heroicTrait', 'weaponOptions', 'marksOfChaos', 'Ensorcelled Banners', 'First Circle Titles', 'otherWarscrollOption', ...roster.otherEnhancements]

    const setUnitForExport = (unit) => {
        const data = {
            id: unit.id,
            name: unit.name,
            points: unit.points,
            modelCount: (unit.isReinforced ? 2 : 1) * unit.modelCount,
        }
        forEach(additionalUnitOptions, option => {
            if (unit[option]) {
                data[option] = unit[option]
            }
        })
        return data
    }

    const setManifestationForExport = (manifestation) => ({
        id: manifestation.id,
        name: manifestation.name
    })

    const setRegimentForExport = (regiment) => ({
        heroId: regiment.heroId,
        points: regiment.points,
        units: map(regiment.units, setUnitForExport)
    })

    const setRegimentOfRenownForExport = (regimentOfRenown) => ({
        id: regimentOfRenown.id,
        name: regimentOfRenown.name,
        points: regimentOfRenown.regimentOfRenownPointsCost
    })

    const getPlayerInfo = useCallback(async () => {
        fetch(`https://aoscom.online/players/player/?tg_id=${user?.id}`)
            .then(response => response.json())
            .then(data => {
                player.roster = data.roster
                player.allegianceId = JSON.parse(data.roster_stat)?.allegianceId
                player.allegiance = JSON.parse(data.roster_stat)?.allegiance
            })
            .catch(error => console.error(error))
    }, [user?.id])

    const getErrorText = (error) => `- ${error}`

    const getErrorsText = (_errors) => _errors.map(getErrorText).join('\n')

    const getEnchancement = (unit, enhancement) => unit[enhancement] ? `\n[${enhancement}]: ${unit[enhancement]}` : ''

    const getUnitForExport = (unit) => `${unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x ` : ''}${unit.name} (${unit.points || unit.regimentOfRenownPointsCost || 0} points)${unit.artefact ? `\n[Artefact]: ${unit.artefact}` : ''}${unit.heroicTrait ? `\n[Heroic Trait]: ${unit.heroicTrait}` : ''}${unit.weaponOptions ? `${getWeaponOptionsForExport(unit)}` : ''}${map(roster.otherEnhancements, otherEnhancement => getEnchancement(unit, otherEnhancement))}${unit.otherWarscrollOption ? `\n• ${unit.otherWarscrollOption}` : ''}`

    const getRoRUnitForExport = (unit) => `${unit.modelCount ? `${unit.modelCount} x` : ''} ${unit.name} ${unit.artefact ? `\n[Artefact]: ${unit.artefact}` : ''}${unit.heroicTrait ? `\n[Heroic Trait]: ${unit.heroicTrait}` : ''}${unit.weaponOptions ? `${getWeaponOptionsForExport(unit)}` : ''}${unit.marksOfChaos ? `\n• ${unit.marksOfChaos}` : ''}${unit['Ensorcelled Banners'] ? `\n• ${unit['Ensorcelled Banners']}` : ''}${unit.otherWarscrollOption ? `\n• ${unit.otherWarscrollOption}` : ''}`

    const getUnitsForExport = (units, isRoR) => units.map(isRoR ? getRoRUnitForExport : getUnitForExport).join('\n')

    const getWeaponForExport = ([key, value]) => value
        ? `\n• ${value} x ${key}`
        : ''

    const getWeaponOptionForExport = ([key, value]) => {
        return Object.entries(value).map(getWeaponForExport)
    }

    const getWeaponOptionsForExport = (unit) => {
        const text = Object.entries(unit.weaponOptions).map(getWeaponOptionForExport)
        return `${text}`.replace(/,/g, '')
    }

    const getRegimentForExport = (regiment, index) => `Regiment ${index + 1}\n${roster.generalRegimentIndex === index ? "General's regiment\n" : ''}${regiment.units.map(getUnitForExport).join('\n')}\n----`

    const getRegimentsForExport = () => roster.regiments.map(getRegimentForExport).join('\n')

    const handleExportList = () => {
        const rosterText = `${errors.length > 0 ? `Roster errors:\n${getErrorsText(errors)}\n\n` : ''}${warnings.length > 0 ? `Roster warnings:\n${getErrorsText(warnings)}\n\n` : ''}Grand Alliance: ${roster.grandAlliance}
Faction: ${roster.allegiance}
Battle Formation: ${roster.battleFormation}${roster.points.battleFormation ? ` (${roster.points.battleFormation}${Constants.noBreakSpace}pts)` : ''}
Battle Tactics Cards: ${get(roster, 'tactics[0].name', '')}${size(roster.tactics) === 2 ? ` and ${get(roster, 'tactics[1].name', '')}` : ''}
Drops: ${drops}${roster.auxiliaryUnits.length > 0 ? `\nAuxiliaries: ${roster.auxiliaryUnits.length}` : ''}

${roster.spellsLore ? `Spell Lore: ${roster.spellsLore}${roster.points.spellsLore ? ` (${roster.points.spellsLore}${Constants.noBreakSpace}pts)` : ''}` : ''}${roster.prayersLore ? `\nPrayer Lore: ${roster.prayersLore}` : ''}${roster.manifestationLore ? `\nManifestation Lore: ${roster.manifestationLore}${roster.points.manifestations ? ` (${roster.points.manifestations}${Constants.noBreakSpace}pts)` : ''}` : ''}${roster.factionTerrain ? `\nFaction Terrain: ${roster.factionTerrain}${roster.points.terrain ? ` (${roster.points.terrain}${Constants.noBreakSpace}pts)` : ''}` : ''}
-----
${getRegimentsForExport()}
${roster.regimentOfRenown ? `Regiment Of Renown\n${getUnitForExport(roster.regimentOfRenown)}\n` : ''}
${roster.regimentsOfRenownUnits.length > 0 ? `${getUnitsForExport(roster.regimentsOfRenownUnits, true)}\n-----` : ''}
${roster.auxiliaryUnits.length > 0 ? `Auxiliary Units\n${getUnitsForExport(roster.auxiliaryUnits)}\n-----` : ''}
Wounds: ${wounds}
${roster.points.all}/${roster.pointsLimit} Pts
`
        navigator.clipboard.writeText(rosterText)
        toast.success('List Copied', Constants.toastParams)
        setIsCopy(true)
    }

    const pickKeys = (unit, keys) => {
        return keys.reduce((acc, key) => {
            if (unit.hasOwnProperty(key)) {
                acc[key] = unit[key];
            }
            return acc;
        }, {});
    }

    const getShortUnits = (units = [], keys) => {
        if (size(units)) {
            return map(units, (unit) => {
                return pickKeys(unit, keys)
            })
        }
        return null
    }

    const getShortRegiments = () => {
        return map(roster.regiments, (regiment) => {
            const units = getShortUnits(regiment.units, unitsKeys)
            return JSON.stringify({...regiment, units})
        })
    }

    const handleSendRoster = useCallback(async () => {
        const r_stat = {
            grandAlliance: roster.grandAlliance,
            allegiance: roster.allegiance,
            points: roster.points,
            drops: drops,
            wounds: getWoundsCount(roster),
            uniques: getUniques(),
        }        
        const _roster = {
            allegiance: roster.allegiance,
            allegianceId: roster.allegianceId,
            auxiliaryUnits: map(roster.auxiliaryUnits, setUnitForExport),
            battleFormation: roster.battleFormation,
            factionTerrain: roster.factionTerrain,
            generalRegimentIndex: roster.generalRegimentIndex,
            grandAlliance: roster.grandAlliance,
            manifestationLore: roster.manifestationLore,
            manifestationsList: map(roster.manifestationsList, setManifestationForExport),
            points: roster.points,
            pointsLimit: roster.pointsLimit,
            prayersLore: roster.prayersLore,
            regimentOfRenown: roster.regimentOfRenown ? setRegimentOfRenownForExport(roster.regimentOfRenown) : null,
            regiments: map(roster.regiments, setRegimentForExport),
            regimentsOfRenownUnits: map(roster.regimentsOfRenownUnits, setUnitForExport),
            spellsLore: roster.spellsLore,
            tactics: map(roster.tactics, 'name')
        }
        await fetch(`https://aoscom.online/rosters/?tg_id=${user?.id}&roster=${JSON.stringify(_roster)}&r_stat=${JSON.stringify(r_stat)}`, {
            method: 'PUT'
        })
            .then(response => {
                toast.success('Благодарим, ваш ростер принят', Constants.toastParams)
                getPlayerInfo()
                setTimeout(() => {
                    navigate('/', {state: {isShowToast: true}})
                }, 1000)
                cleanBuilder()
            })
            .catch(error => console.error(error))
    // eslint-disable-next-line
    }, [])

    const handleSaveList = async () => {
        const data = cleanObject({
            id: roster.id,
            allegiance: roster.allegiance,
            allegiance_id: roster.allegianceId,
            auxiliary_units: JSON.stringify(getShortUnits(roster.auxiliaryUnits, unitsKeys)),
            battle_formation: roster.battleFormation,
            faction_terrain: roster.factionTerrain,
            general_regiment_index: roster.generalRegimentIndex,
            grand_alliance: roster.grandAlliance,
            manifestation_lore: roster.manifestationLore,
            manifestations_list: JSON.stringify(getShortUnits(roster.manifestationsList, manifistationsKeys)),
            points: roster.points,
            points_limit: roster.pointsLimit,
            prayers_lore: roster.prayersLore,
            regiment_of_renown: roster.regimentOfRenown ? JSON.stringify(pickKeys(roster.regimentOfRenown, rorKeys)) : null,
            regiments: getShortRegiments(),
            regiments_of_renown_units: JSON.stringify(getShortUnits(roster.regimentsOfRenownUnits, unitsKeys)),
            spells_lore: roster.spellsLore,
            tactics: map(roster.tactics, 'name'),
            tg_id: user?.id,
            name: `${user?.last_name || ''} ${user?.first_name || ''}`,
            is_public: isListPublic,
            note: {...roster.note, wounds, drops},
            list_name: listName
        })

        try {
            if (roster.id) {
                await fetch('https://aoscom.online/list', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': "application/json, text/javascript, /; q=0.01"
                    }
                })
            } else {
                await fetch('https://aoscom.online/list', {
                    method: 'PUT',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': "application/json, text/javascript, /; q=0.01"
                    }
                })
            }
        } catch (err) {
            console.error(err.message)
        }
        handleCloseModal()
        toast.success('List Saved', Constants.toastParams)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    // const handleClickSaveButton = () => {
    //     setIsModalOpen(true)
    // }

    const handleDeleteList = (listId) => async () => {
        try {
            await fetch(`https://aoscom.online/list/?id=${listId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json, text/javascript, /; q=0.01"
                }
            })
            lists.count--
            forceUpdate()
        } catch (err) {
            console.error(err.message)
        }
    }

    const renderList = (list) => <div id={Styles.listDeletedContainer} onClick={handleDeleteList(list.id)}>
        <div>
            <p id={Styles.listDeletedTitle}>{list.name}</p>
            <p id={Styles.listDeletedSubtitle}>{list.allegiance}</p>
        </div>
        <img id={Styles.allegianceInfoIcon} src={Close} alt="" />
    </div>

    const handleBlurName = (e) => {
        setListName(e.target.value)
    }
    const handleChangePublic = () => {
        setIsListPublic(!isListPublic)
    }

    const renderModalContent = () => {
        if (lists.count >= Constants.listsMax) {
            return <>
                <b id={Styles.modalTitle}>You have reached limit of saved lists</b>
                <p id={Styles.modalText}>You can delete one of your list</p>
                {map(lists.data, renderList)}
            </>
        }
        return <>
            <b id={Styles.modalTitle}>Save Roster</b>
            <FloatingLabelInput
                style={inputStyles.listName}
                onBlur={handleBlurName}
                label='List Name'
                defaultValue={listName}
            />
            <div id={Styles.publicCheckboxContainer} onClick={handleChangePublic}>
                <p id={Styles.potentialLegends}>Save as public</p>
                <Checkbox onClick={handleChangePublic} checked={isListPublic} />
            </div>
            <p id={Styles.publicNote}>Other users will be able to see this list.</p>
            <button id={listName ? Styles.button : Styles.disabledButton} disabled={!listName} onClick={handleSaveList}>Save</button>
        </>
    }

    const renderWeapon = ([key, value]) => value
        ? <p>&#8226; {value} x {key}</p>
        : null

    const renderWeaponOption = ([key, value]) => {
        return Object.entries(value).map(renderWeapon)
    }

    const renderWeaponOptions = (weaponOptions) => Object.entries(weaponOptions).map(renderWeaponOption)

    const renderAdditionalOption = (unit, additionalOption) =>
        unit[additionalOption] ? <p>&#8226; {additionalOption}: {unit[additionalOption]}</p> : null

    const renderUnit = (unit, index) => <div key={`${unit.id}-${index}`}>
        <p><b>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x` : ''} {unit.name}</b> ({unit.points || unit.regimentOfRenownPointsCost || 0} points)</p>
        {unit.artefact ? <p>&#8226; {unit.artefact}</p> : null}
        {unit.heroicTrait ? <p>&#8226; {unit.heroicTrait}</p> : null}
        {unit.weaponOptions ? renderWeaponOptions(unit.weaponOptions) : null}
        {unit.marksOfChaos ? <p>&#8226; Mark Of Chaos: {unit.marksOfChaos}</p> : null}
        {size(roster.otherEnhancements) ? map(roster.otherEnhancements, (otherEnhancement, index) => renderAdditionalOption(unit, otherEnhancement)) : null}
        {unit.otherWarscrollOption ? <p>&#8226; {unit.otherWarscrollOption}</p> : null}
    </div>

    const renderRegimentsOfRenownUnit = (unit) => <div>
        <p>{unit.modelCount ? `${unit.modelCount} x` : ''} {unit.name}</p>
        {unit.artefact ? <p>&#8226; {unit.artefact}</p> : null}
        {unit.heroicTrait ? <p>&#8226; {unit.heroicTrait}</p> : null}
        {unit.otherWarscrollOption ? <p>&#8226; {unit.otherWarscrollOption}</p> : null}
    </div>

    const renderRegiment = (regiment, index) => <div key={index} id={Styles.regiment}>
        <p>Regiment {index + 1}</p>
        {roster.generalRegimentIndex === index ? <p>General's regiment</p> : null}
        {regiment.units.map(renderUnit)}
    </div>

    const renderError = (error, index) => <p id={Styles.error}>&#8226; {error}</p>

    const renderWarning = (error, index) => <p  id={Styles.warning}>&#8226; {error}</p>

    return <div id={Styles.container}>
        {/* <div id={Styles.buttonContainer}>
            <button id={Styles.button} onClick={handleClickSaveButton}>Save List</button>
        </div> */}
        {meta.rostersBeingAccepted
            ? <>
                <div id={Styles.buttonContainer}>
                    <button id={disableButton ? Styles.disableButton : Styles.button} disabled={disableButton} onClick={handleSendRoster}>Отправить ростер</button>
                </div>
                {disableButton
                    ? <p id={Styles.errorText}>Пока не будут исправлены все ошибки, ростер нельзя отправить</p>
                    : null
                }
            </>
            : null
        }
        <div id={Styles.buttonContainer}>
            <button id={Styles.button} onClick={handleExportList}>{isCopy ? 'Лист скопирован' : 'Копировать лист'}</button>
        </div>
        {errors.length > 0
            ? <div id={Styles.errorsContainer}>
                <p id={Styles.error}>Roster errors:</p>
                {errors?.map(renderError)}
            </div>
            : null
        }
        {warnings.length > 0
            ? <div id={Styles.warningsContainer}>
                <p id={Styles.warning}>Roster warnings:</p>
                {warnings?.map(renderWarning)}
            </div>
            : null
        }
        <p>Grand Alliance: {roster.grandAlliance}</p>
        <p>Faction: {roster.allegiance}</p>
        <p>Battle Formation: {roster.battleFormation}{roster.points.battleFormation ? ` (${roster.points.battleFormation}pts)` : ''}</p>
        <p>Battle Tactics Cards: {get(roster, 'tactics[0].name', '')}{size(roster.tactics) === 2 ? ` and ${get(roster, 'tactics[1].name', '')}` : ''}</p>
        <p>Drops: {drops}</p>
        {roster.auxiliaryUnits.length > 0 ? <p>Auxiliaries: {roster.auxiliaryUnits.length}</p> : null}
        <br/>
        {roster.spellsLore ? <p>Spell Lore: {roster.spellsLore}{roster.points.spellsLore ? ` (${roster.points.spellsLore}${Constants.noBreakSpace}pts)` : ''}</p> : null}
        {roster.prayersLore ? <p>Prayer Lore: {roster.prayersLore}</p> : null}
        {roster.manifestationLore ? <p>Manifestation Lore: {roster.manifestationLore}{roster.points.manifestations ? ` (${roster.points.manifestations}${Constants.noBreakSpace}pts)` : ''}</p> : null}
        {roster.factionTerrain ? <p>Faction Terrain: {roster.factionTerrain}{roster.points.terrain ? ` (${roster.points.terrain}${Constants.noBreakSpace}pts)` : ''}</p> : null}
        <hr/>
        {roster.regiments.map(renderRegiment)}
        <hr/>
        {roster.auxiliaryUnits.length > 0
            ? <div>
                <p>Auxiliary Units</p>
                {roster.auxiliaryUnits.map(renderUnit)}
                <hr/>
            </div>
            : null
        }
        {roster.regimentOfRenown
            ? <div>
                <p>Regiment Of Renown</p>
                {renderUnit(roster.regimentOfRenown)}
                {roster.regimentsOfRenownUnits?.map(renderRegimentsOfRenownUnit)}
                <hr/>
            </div>
            : null
        }
        <p>Wounds: {wounds}</p>
        <p>{roster.points.all}/{roster.pointsLimit} Pts</p>
        <ToastContainer />
        <Modal open={isModalOpen} onClose={handleCloseModal}>
            <ModalDialog layout="center">
                {renderModalContent()}
            </ModalDialog>
        </Modal>
    </div>
}

export default Export

const inputStyles = {
    listName: {
        '--Input-minHeight': '48px',
        borderRadius: '4px',
        'border-color': '#B4B4B4',
        color: '#000000',
        'box-shadow': 'none',
        'font-family': 'Minion Pro Bold'
    }
}