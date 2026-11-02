import React from 'react';
import {ListCard, ListItem} from './ListCard'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const Battleplans = ({id}) => {
    const battleplans = filter(dataBase.data.rule_container, (group) => group.ruleSectionId === id)
    battleplans.sort((a, b) => a.displayOrder - b.displayOrder)

    const renderRow = (battleplan) => <ListItem
        key={battleplan.id}
        title={battleplan.title}
        navigateTo='battleplan'
        state={{battleplan}}
    />

    return <div id='column' className='Chapter'>
        <ListCard>
            {battleplans && map(battleplans, renderRow)}
        </ListCard>
    </div>
}

export default Battleplans