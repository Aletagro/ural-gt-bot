import React, {useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {navigationState, roster} from '../utilities/appState'
// import {navigationState, roster, lists} from '../utilities/appState'
import {getStringAfterDash} from '../utilities/utils'
import Add from '../icons/add.svg'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import compact from 'lodash/compact'

import Styles from './styles/Lists.module.css'

const dataBase = require('../dataBase.json')

// const tg = window.Telegram.WebApp

const Lists = () => {
    const navigate = useNavigate()
    // const user = tg.initDataUnsafe?.user
    let isListResponsed = false

    const handleGetList = useCallback(async () => {
        try {
            // const response = await fetch(`https://aoscom.online/lists/tg_id=${user?.id}`)
            // const data = await response.json()
            // lists.data = data
            // lists.count = size(data)
        } catch (err) {
            console.error(err.message)
        }
      }, [])

    if (!isListResponsed) {
        handleGetList()
        isListResponsed = true
    }

    const handleAddNewRoster = () => {
        navigate('/chooseGrandAlliance')
    }


    const getUnits = (units) => map(units, (unit) => {
        const _unit = find(dataBase.data.warscroll, ['id', unit.id])
        return {..._unit, ...unit}
    })

    const getTactic = (tacticName) => {
        const tacticCard = find(dataBase.data.rule_container, (card) => getStringAfterDash(card.title) === tacticName)
        return tacticCard ? {...tacticCard, name: tacticName} : null
    }

    const handleNavigateToRoster = (list) => () => {
        const regiments = map(list.regiments, (regiment) => {
            const _regiment = JSON.parse(regiment)
            const units = getUnits(_regiment.units)
            return {..._regiment, units}
        })
        let tactics = []
        if (size(list.tactics) > 0) {
            tactics = compact(map(list.tactics, getTactic))
        }
        roster.id = list.id
        roster.allegiance = list.allegiance
        roster.allegianceId = list.allegiance_id
        roster.auxiliaryUnits = list.auxiliary_units ? getUnits(JSON.parse(list.auxiliary_units)) : []
        roster.battleFormation = list.battle_formation
        roster.factionTerrain = list.faction_terrain
        roster.generalRegimentIndex = list.general_regiment_index
        roster.grandAlliance = list.grand_alliance
        roster.manifestationLore = list.manifestation_lore
        roster.manifestationsList = list.manifestations_list ? getUnits(JSON.parse(list.manifestations_list)) : []
        roster.points = list.points || {all: 0}
        roster.pointsLimit = list.points_limit
        roster.prayersLore = list.prayers_lore
        roster.regimentOfRenown = list.regiment_of_renown ? find(dataBase.data.ability_group, ['id', JSON.parse(list.regiment_of_renown)?.id]) : null
        roster.regiments = regiments
        roster.regimentsOfRenownUnits = list.regiments_of_renown_units ? getUnits(JSON.parse(list.regiments_of_renown_units)) : []
        roster.tactics = tactics
        roster.spellsLore = list.spells_lore
        roster.isPublic = list.is_public
        roster.note = list.note
        roster.listName = list.list_name
        navigationState.isBuilder = true
        navigate('/builder', {state: {title: list.allegiance, alliganceId: list.allegiance_id}})
    }

    const renderList = (list) => {
        const army = find(dataBase.data.faction_keyword, ['id', list.allegiance_id])
        return <button id={Styles.button} onClick={handleNavigateToRoster(list)} key={list.id}>
            <img src={army?.moreInfoImage} alt={army?.name} id={Styles.image} />
            <div id={Styles.textContainer}>
                <p id={Styles.text}>{list.name}</p>
                <p id={Styles.text}>{army?.name}</p>
            </div>
        </button>
    }

    return  <div id='column' className='Chapter'>
        <button id={Styles.newRosterButton} onClick={handleAddNewRoster}>
            <p>New List</p>
            <img src={Add} alt='' />
        </button>
        <p id={Styles.notice}>You can only save 3 army lists.</p>
        <div id={Styles.buttonContainer}>
            {_lists.map(renderList)}
            {/* {lists.data.map(renderList)} */}
        </div>
    </div>
}

export default Lists

const _lists = [
    {"id":2,"allegiance":"Ironjawz","allegiance_id":"298391fb-3d74-4a26-b9cc-5f3ad5fe4852","auxiliary_units":"[{\"id\":\"df89996b-4ff9-4a97-b114-c5048ca2ccac\",\"name\":\"Scourge of Ghyran Gore-gruntas\",\"points\":200,\"modelCount\":3}]","battle_formation":"Weirdfist","faction_terrain":"Bossrokk Tower","general_regiment_index":0,"grand_alliance":"Destruction","manifestation_lore":"Manifestations of Gorkamorka","manifestations_list":"[{\"id\":\"60c7f2f1-404e-4977-a010-038fb7d3fe0e\",\"name\":\"Gork-Roara\"},{\"id\":\"eed073c7-9c3b-4cc1-8ca0-76c15281b851\",\"name\":\"Morkspit Marsh\"},{\"id\":\"72f67f0e-536d-4a93-96b9-e0a21157ccbd\",\"name\":\"Foot of Gork\"}]","points":{"all":1960,"terrain":null,"manifestations":0},"points_limit":2000,"prayers_lore":"Warbeats","regiment_of_renown":"{\"id\":\"44afc18b-98b0-42c6-8721-30a5a7fbc279\",\"name\":\"Nurgle's Gift\",\"regimentOfRenownPointsCost\":180}","regiments":["{\"units\":[{\"id\":\"559206b2-5853-4d8c-b1b3-24dd991e5219\",\"name\":\"Gordrakk, the Fist of Gork\",\"points\":360,\"modelCount\":1},{\"id\":\"595b7d56-c353-451e-b087-19a2c569d1e6\",\"name\":\"Ardboyz\",\"points\":360,\"modelCount\":10,\"isReinforced\":true},{\"id\":\"595b7d56-c353-451e-b087-19a2c569d1e6\",\"name\":\"Ardboyz\",\"points\":180,\"modelCount\":10,\"isReinforced\":false}],\"heroId\":\"559206b2-5853-4d8c-b1b3-24dd991e5219\",\"points\":900}","{\"units\":[{\"id\":\"be783899-1a5b-470f-a1a7-cae4e07c0415\",\"name\":\"Megaboss\",\"points\":170,\"modelCount\":1,\"artefact\":\"Amberbone Whetstone\"},{\"id\":\"354b6244-b8cc-4548-8413-47c532e49810\",\"name\":\"Zoggrok Anvilsmasha\",\"points\":170,\"modelCount\":1,\"weaponOptions\":{\"78a4f85a-a748-4221-ad0b-bdd26b345c8e\":{\"Grunta-tongs\":1}}}],\"heroId\":\"be783899-1a5b-470f-a1a7-cae4e07c0415\",\"points\":340}","{\"units\":[{\"id\":\"3a43ff54-fc39-40e8-b6fe-8734661121d2\",\"name\":\"Megaboss on Maw-Krusha\",\"points\":340,\"modelCount\":1,\"Ironjawz Monstrous Traits\":\"Fast 'Un\"}],\"heroId\":\"3a43ff54-fc39-40e8-b6fe-8734661121d2\",\"points\":340}"],"regiments_of_renown_units":"[{\"id\":\"66f81f93-b406-4055-9e43-d84f4aa78308\",\"name\":\"Nurglings\",\"points\":100,\"modelCount\":3},{\"id\":\"66f81f93-b406-4055-9e43-d84f4aa78308\",\"name\":\"Nurglings\",\"points\":100,\"modelCount\":3}]","spells_lore":"Lore of the Weird","tactics":["Restless Energy","Master the Paths"],"name":" ","is_public":true,"note":{"wounds":152,"drops":5},"list_name":"List-1"},
    {"allegiance":"Scions of Nulahmia","allegiance_id":"f8118087-18de-49b9-b921-e76e11922f34","auxiliary_units":"null","general_regiment_index":1,"grand_alliance":"Death","manifestations_list":"null","points":{"all":360,"manifestations":0},"points_limit":2000,"regiments":["{\"units\":[{\"id\":\"6aece97c-a1a5-42f2-b3cb-33a48a646d77\",\"name\":\"Scourge of Ghyran Sekhar, Fang of Nulahmia\",\"points\":220,\"modelCount\":1}],\"heroId\":\"6aece97c-a1a5-42f2-b3cb-33a48a646d77\",\"points\":220}","{\"units\":null,\"heroId\":\"\",\"points\":0,\"artefact\":\"\",\"heroicTrait\":\"\"}","{\"units\":[{\"id\":\"25df260c-4346-4b66-bfa2-2656e05f14ff\",\"name\":\"Vampire Lord\",\"points\":140,\"modelCount\":1,\"artefact\":\"Amulet of Leeches\"}],\"heroId\":\"25df260c-4346-4b66-bfa2-2656e05f14ff\",\"points\":140}"],"regiments_of_renown_units":"null","spells_lore":"Scions of Nulahmia Spell Lore","tactics":["Restless Energy","Master the Paths"],"name":" ","is_public":true,"note":{"wounds":11,"drops":3},"list_name":"List-1"},
    {"allegiance":"Fyreslayers","allegiance_id":"e9d8e88a-eed6-47f1-9263-7440476aeeba","auxiliary_units":"null","faction_terrain":"Magmic Battleforge","grand_alliance":"Order","manifestations_list":"null","points":{"all":0,"terrain":null},"points_limit":2000,"regiments":["{\"units\":null,\"heroId\":\"\",\"points\":0}"],"regiments_of_renown_units":"null","tactics":[],"name":" ","is_public":true,"note":{"wounds":0,"drops":1},"list_name":"List-1"}
]
