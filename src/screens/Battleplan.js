import React from 'react';
import {useLocation} from 'react-router-dom'
import {sortByName} from '../utilities/utils'
import Rule from '../components/Rule'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const Battleplan = () => {
    const {battleplan} = useLocation().state
    const id = find(dataBase.data.rule_container, ['ruleSectionId', battleplan.id])?.id
    const data = filter(dataBase.data.rule_container_component, ['ruleContainerId', id])
    sortByName(data, 'displayOrder')

    const renderRuleComponent = (rule) => <Rule key={rule.id} rule={rule} />

    return <div id='column' className='Chapter'>
        {map(data, renderRuleComponent)}
    </div>
}

export default Battleplan