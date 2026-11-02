import React from 'react';
import {useLocation} from 'react-router-dom'
import {ListCard, ListItem} from '../components/ListCard'

import map from 'lodash/map'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const RuleSections = () => {
    const {document} = useLocation().state
    const ruleSections = filter(dataBase.data.rule_section, (section) => section.publicationId === document.id && !section.parentId)
    ruleSections.sort((a, b) => a.displayOrder - b.displayOrder)
    
    const renderRow = (chapter) => <ListItem
        key={chapter.id}
        title={chapter.name}
        navigateTo='ruleChapters'
        state={{chapter}}
    />

    return <div id='column' className='Chapter'>
        <ListCard>
            {ruleSections && map(ruleSections, renderRow)}
        </ListCard>
    </div>
}

export default RuleSections