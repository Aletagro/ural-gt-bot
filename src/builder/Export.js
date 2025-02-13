import React, {useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import {roster, player, navigationState} from '../utilities/appState'
import {getErrors, getWarnings, getWoundsCount} from '../utilities/utils'

import forEach from 'lodash/forEach'
import includes from 'lodash/includes'

import Styles from './styles/Export.module.css'

const additionalOptions = ['Ensorcelled Banners', 'First Circle Titles']

const tg = window.Telegram.WebApp

const Export = () => {
    const user = tg.initDataUnsafe?.user
    const errors = getErrors(roster)
    const warnings = getWarnings(roster)
    const disableButton = Boolean(errors.length || warnings.length)
    const navigate = useNavigate()

    const getUnitForExport = (unit) => `${unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x` : ''} ${unit.name} (${unit.points || unit.regimentOfRenownPointsCost || 0} points)${unit.artefact ? `\n[Artefact]: ${unit.artefact}` : ''}${unit.heroicTrait ? `\n[Heroic Trait]: ${unit.heroicTrait}` : ''}${unit.weaponOptions ? `${getWeaponOptionsForExport(unit)}` : ''}${unit.marksOfChaos ? `\n• ${unit.marksOfChaos}` : ''}${unit['Ensorcelled Banners'] ? `\n• ${unit['Ensorcelled Banners']}` : ''}${unit.otherWarscrollOption ? `\n• ${unit.otherWarscrollOption}` : ''}`

    const getUnitsForExport = (units) => units.map(getUnitForExport).join('\n')

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

    const getDropsCount = () => {
        return roster.regiments.length + roster.auxiliaryUnits.length + (roster.regimentOfRenown ? 1 : 0)
    }

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

    const cleanBuilder = () => {
        roster.regiments = [{units: [], heroId: '', points: 0}]
        roster.generalRegimentIndex = null
        roster.battleFormation = null
        roster.withoutBattleFormation = false
        roster.points = 0
        roster.spellsLore = ''
        roster.prayersLore = ''
        roster.manifestationLore = ''
        roster.manifestationsList = []
        roster.factionTerrain = ''
        roster.auxiliaryUnits = []
        roster.regimentOfRenown = null
        roster.battleFormation = ''
        roster.requiredGeneral = null
        navigationState.isBuilder = false
    }

    const handleSendRoster = useCallback(async () => {
        const rosterText = `Grand Alliance: ${roster.grandAlliance}
Faction: ${roster.allegiance}
Battle Formation: ${roster.battleFormation}
Drops: ${roster.regiments.length + roster.auxiliaryUnits.length + (roster.regimentOfRenown ? 1 : 0)}${roster.auxiliaryUnits.length > 0 ? `\nAuxiliaries: ${roster.auxiliaryUnits.length}` : ''}

${roster.spellsLore ? `Spell Lore: ${roster.spellsLore}` : ''}${roster.prayersLore ? `\nPrayer Lore: ${roster.prayersLore}` : ''}${roster.manifestationLore ? `\nManifestation Lore: ${roster.manifestationLore}` : ''}${roster.factionTerrain ? `\nFaction Terrain: ${roster.factionTerrain}` : ''}
-----
${getRegimentsForExport()}
${roster.regimentOfRenown ? `Regiment Of Renown\n${getUnitForExport(roster.regimentOfRenown)}\n-----` : ''}
${roster.auxiliaryUnits.length > 0 ? `Auxiliary Units\n${getUnitsForExport(roster.auxiliaryUnits)}\n-----` : ''}
Wounds: ${getWoundsCount(roster)}
${roster.points}/${roster.pointsLimit} Pts
`
        const r_stat = {
            grandAlliance: roster.grandAlliance,
            allegiance: roster.allegiance,
            points: roster.points,
            drops: getDropsCount(),
            wounds: getWoundsCount(roster),
            uniques: getUniques(),
            allegianceId: roster.allegianceId
        }
        await fetch(`https://aoscom.online/rosters/?tg_id=${user?.id}&roster=${JSON.stringify(rosterText)}&r_stat=${JSON.stringify(r_stat)}`, {
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

    const renderWeapon = ([key, value]) => value
        ? <p>&#8226; {value} x {key}</p>
        : null

    const renderWeaponOption = ([key, value]) => {
        return Object.entries(value).map(renderWeapon)
    }

    const renderWeaponOptions = (weaponOptions) => Object.entries(weaponOptions).map(renderWeaponOption)

    const renderAdditionalOption = (unit) => (additionalOption) =>
        unit[additionalOption] ? <p>&#8226; {additionalOption}: {unit[additionalOption]}</p> : null

    const renderUnit = (unit, index) => <div key={`${unit.id}-${index}`}>
        <p><b>{unit.modelCount ? `${unit.modelCount * (unit.isReinforced ? 2 : 1)} x` : ''} {unit.name}</b> ({unit.points || unit.regimentOfRenownPointsCost || 0} points)</p>
        {unit.artefact ? <p>&#8226; {unit.artefact}</p> : null}
        {unit.heroicTrait ? <p>&#8226; {unit.heroicTrait}</p> : null}
        {unit.weaponOptions ? renderWeaponOptions(unit.weaponOptions) : null}
        {unit.marksOfChaos ? <p>&#8226; Mark Of Chaos: {unit.marksOfChaos}</p> : null}
        {additionalOptions.map(renderAdditionalOption(unit))}
        {unit.otherWarscrollOption ? <p>&#8226; {unit.otherWarscrollOption}</p> : null}
    </div>

    const renderRegimentsOfRenownUnit = (unit) => <p key={unit.id}>{unit.name}</p>

    const renderRegiment = (regiment, index) => <div key={index}>
        <p>Regiment {index + 1}</p>
        {roster.generalRegimentIndex === index ? <p>General's regiment</p> : null}
        {regiment.units.map(renderUnit)}
    </div>

    const renderError = (error, index) => <p id={Styles.error}>&#8226; {error}</p>

    const renderWarning = (error, index) => <p  id={Styles.warning}>&#8226; {error}</p>

    return <div id={Styles.container}>
        <div id={Styles.buttonContainer}>
            <button id={disableButton ? Styles.disableButton : Styles.button} disabled={disableButton} onClick={handleSendRoster}>Отправить ростер</button>
        </div>
        {disableButton
            ? <p id={Styles.errorText}>Пока не будут исправлены все ошибки, ростер нельзя отправить</p>
            : null
        }
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
        <p>Battle Formation: {roster.battleFormation}</p>
        <p>Drops: {getDropsCount()}</p>
        {roster.auxiliaryUnits.length > 0 ? <p>Auxiliaries: {roster.auxiliaryUnits.length}</p> : null}
        <br/>
        {roster.spellsLore ? <p>Spell Lore: {roster.spellsLore}</p> : null}
        {roster.prayersLore ? <p>Prayer Lore: {roster.prayersLore}</p> : null}
        {roster.manifestationLore ? <p>Manifestation Lore: {roster.manifestationLore}</p> : null}
        {roster.factionTerrain ? <p>Faction Terrain: {roster.factionTerrain}</p> : null}
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
        <p>Wounds: {getWoundsCount(roster)}</p>
        {roster.regimentsOfRenownUnits?.length > 1 ? <h6 id={Styles.note}>The number of wounds may contain an error due to Regiment Of Renown</h6> : null}
        <p>{roster.points}/{roster.pointsLimit} Pts</p>
        <ToastContainer />
    </div>
}

export default Export
