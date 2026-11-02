import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName} from '../utilities/utils'
import ImageCard from '../components/ImageCard'
import Constants from '../Constants'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

const dataBase = require('../dataBase.json')

const Catalog = () => {
    const {grandAlliance} = useLocation().state
    let allegiances = filter(dataBase.data.faction_keyword, (faction) => faction.parentFactionKeywordId === grandAlliance.id)
    // нужно чтобы орков разделить на отдельные книги
    if (grandAlliance.name === 'Destruction') {
        const orrukWarclansId = find(allegiances, allegiance => allegiance.name === 'Orruk Warclans')?.id
        const orrukAllegiances = filter(dataBase.data.faction_keyword, (faction) => faction.parentFactionKeywordId === orrukWarclansId && !faction.armyOfRenown)
        allegiances = [...allegiances, ...orrukAllegiances]
        allegiances = filter(allegiances, allegiance => allegiance.name !== 'Orruk Warclans')
    }
    sortByName(allegiances)

    const renderRow = (allegiance) => {
        const isLegendaryArmies = includes(Constants.legendaryArmies, allegiance.id)
        return <ImageCard
            key={allegiance.id}
            title={allegiance.name}
            image={allegiance.selectFactionImage}
            badge={isLegendaryArmies ? 'Legend' : undefined}
            navigateTo='army'
            state={{allegiance, grandAlliance: grandAlliance.name}}
        />
    }

    return <div id='column' className='Chapter'>
        {allegiances && map(allegiances, renderRow)}
    </div>
}

export default Catalog