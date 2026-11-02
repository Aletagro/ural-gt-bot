import React from 'react';
import {useLocation} from 'react-router-dom'
import {ListCard, ListItem} from '../components/ListCard'
import Battleplans from '../components/Battleplans'
import Tactics from '../components/Tactics'
import Rules from './Rules'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const RuleChapters = () => {
    const {chapter} = useLocation().state
    const ruleChapters = filter(dataBase.data.rule_section, (section) => section.parentId === chapter.id)
    ruleChapters.sort((a, b) => a.displayOrder - b.displayOrder)

    const renderRow = (paragraph) => <ListItem
        key={paragraph.id}
        title={paragraph.name}
        navigateTo='rules'
        state={{paragraph}}
    />

    return ruleChapters.length > 0
        ? <div id='column' className='Chapter'>
            <ListCard>
                {ruleChapters && map(ruleChapters, renderRow)}
            </ListCard>
        </div>
        : chapter.name === 'Battleplans 2026-27'
            ? <Battleplans id={chapter.id} />
            : chapter.name === 'Battle Tactics 2026-27'
                ? <Tactics id={chapter.id} /> 
                : <Rules info={chapter} />
}

export default RuleChapters