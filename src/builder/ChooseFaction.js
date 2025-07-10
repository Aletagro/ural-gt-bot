import React from 'react';
import {useLocation} from 'react-router-dom'
import {roster, navigationState} from '../utilities/appState'
import {sortByName, cleanBuilder} from '../utilities/utils'
import BuilderRow from './BuilderRow'
import HeaderImage from '../components/HeaderImage'
import Constants from '../Constants'

import map from 'lodash/map'
import includes from 'lodash/includes'

import Styles from './styles/ChooseFaction.module.css'

const dataBase = require('../dataBase.json')

const ChooseFaction = () => {
    const {grandAlliance} = useLocation().state
    let allegiances = dataBase.data.faction_keyword.filter((faction) => faction.parentFactionKeywordId === grandAlliance.id)
    const armiesOfRenown = map(allegiances, ({id}) => dataBase.data.faction_keyword.filter(({parentFactionKeywordId, armyOfRenown}) => parentFactionKeywordId === id && armyOfRenown))?.filter(array => array.length > 0)
    // нужно чтобы орков разделить на отдельные книги
    if (grandAlliance.name === 'Destruction') {
        const orrukWarclansId = allegiances.find(allegiance => allegiance.name === 'Orruk Warclans')?.id
        const orrukAllegiances = dataBase.data.faction_keyword.filter((faction) => faction.parentFactionKeywordId === orrukWarclansId && !faction.armyOfRenown)
        allegiances = [...allegiances, ...orrukAllegiances]
        allegiances = allegiances.filter(allegiance => allegiance.name !== 'Orruk Warclans')
    }
    sortByName(allegiances)

    const handleClick = ({allegiance}) => {
        if (roster.allegianceId !== allegiance.id) {
            cleanBuilder()
            roster.allegiance = allegiance.name
            roster.allegianceId = allegiance.id
        }
        navigationState.isBuilder = true
    }
    
    const renderRow = (allegiance) => {
        const isLegendaryArmies = includes(Constants.legendaryArmies, allegiance.id)
        return <BuilderRow
            key={allegiance.id}
            title={`${allegiance.name}${isLegendaryArmies ? ' (Legend)' : ''}`}
            navigateTo='builder'
            state={{allegiance}}
            onClick={handleClick}
        />
    }

    const renderArmyOfRenown = (army) => map(army, renderRow)

    return <>
        <HeaderImage src={grandAlliance.image} alt={grandAlliance.name} isWide />
        <div id='column' className='Chapter'>
            <h4 id={Styles.title}>Choose your Faction</h4>
            {allegiances && map(allegiances, renderRow)}
            {armiesOfRenown.length > 0
                ? <>
                    <h4 id={Styles.title}>Armies Of Renown</h4>
                    {map(armiesOfRenown, renderArmyOfRenown)}
                </>
                : null
            }
        </div>
    </>
}

export default ChooseFaction