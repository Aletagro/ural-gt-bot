import React from 'react'
import Constants from '../Constants'
import ImageCard from '../components/ImageCard'

import map from 'lodash/map'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'

const dataBase = require('../dataBase.json')

const Legends = () => {
    const units = filter(dataBase.data.warscroll, 'isLegends')
    const sortedUnits = {
        Chaos: [],
        Death: [],
        Destruction: [],
        Order: []
    }

    forEach(units, (unit) => {
        if (includes(unit.referenceKeywords, 'Chaos')) {
            sortedUnits.Chaos.push(unit)
        } else if (includes(unit.referenceKeywords, 'Death')) {
            sortedUnits.Death.push(unit)
        } else if (includes(unit.referenceKeywords, 'Destruction')) {
            sortedUnits.Destruction.push(unit)
        } else if (includes(unit.referenceKeywords, 'Order')) {
            sortedUnits.Order.push(unit)
        }
    })

    const renderRow = (grandAlliance) => <ImageCard
        key={grandAlliance.id}
        title={grandAlliance.name}
        image={grandAlliance.image}
        size='lg'
        navigateTo='legendUnits'
        state={{units: sortedUnits[grandAlliance.name], image: grandAlliance.image}}
    />

    return <div id='column' className='Chapter'>
        {map(Constants.grandAlliances, renderRow)}
    </div>
}

export default Legends