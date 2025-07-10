import React from 'react'
import Row from './Row'
import {sortByName, getStringAfterDash} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const Tactics = ({id}) => {
    const tactics = filter(dataBase.data.rule_container, (group) => group.ruleSectionId === id)
    sortByName(tactics, 'displayOrder')

    const renderRow = (tactic) => <Row
        key={tactic.id}
        title={getStringAfterDash(tactic.title)}
        navigateTo='tactic'
        state={{tactic}}
    />

    return <div id='column' className='Chapter'>
        {tactics && map(tactics, renderRow)}
    </div>
}

export default Tactics