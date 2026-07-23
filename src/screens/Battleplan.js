import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName} from '../utilities/utils'
import Rule from '../components/Rule'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const Battleplan = () => {
    const {battleplan} = useLocation().state
    const data = filter(dataBase.data.rule_container_component, ['ruleContainerId', battleplan.id])
    sortByName(data, 'displayOrder')

    const renderRuleComponent = (rule) => <Rule key={rule.id} rule={rule} />

    return <div id='column' className='Chapter'>
        {map(data, renderRuleComponent)}
    </div>
}

export default Battleplan