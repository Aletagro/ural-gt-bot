import React from 'react'
import {ListCard, ListItem} from './ListCard'
import {sortByName, getStringAfterDash} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const Tactics = ({id}) => {
    const tactics = filter(dataBase.data.rule_container, (group) => group.ruleSectionId === id)
    sortByName(tactics, 'displayOrder')

    const renderRow = (tactic) => <ListItem
        key={tactic.id}
        title={getStringAfterDash(tactic.title)}
        navigateTo='tactic'
        state={{tactic}}
    />

    return <div id='column' className='Chapter'>
        <ListCard>
            {tactics && map(tactics, renderRow)}
        </ListCard>
    </div>
}

export default Tactics