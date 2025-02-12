import React from 'react'
import Constants from '../Constants'
import {regimentSortesByGrandAlliances} from '../utilities/utils'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Accordion from '../components/Accordion'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

const dataBase = require('../dataBase.json')

const RegimentsOfRenownList = () => {
    const regimentsOfRenown = filter(dataBase.data.ability_group, (group) => group.abilityGroupType === 'regimentOfRenown')
    const sortedRegimentsOfRenown = regimentSortesByGrandAlliances(regimentsOfRenown.map(regiment => {
        const keywords = find(dataBase.data.warscroll, warscroll => warscroll.id === regiment.regimentOfRenownRowImageWarscrollId).referenceKeywords
        return {...regiment, keywords}
    }))

    const renderRow = (regiment) => <Row
        key={regiment.id}
        title={regiment.name}
        rightText={regiment?.regimentOfRenownPointsCost ? `${regiment?.regimentOfRenownPointsCost} pts` : undefined}
        navigateTo='regimentOfRenown'
        state={{regiment}}
    />

    const renderRegimentAlliance = (alliance) => <Accordion
        title={alliance.title}
        data={alliance.regiments}
        renderItem={renderRow}
    />

    return <>
        <HeaderImage src={Constants.regimentsOfRenownImage} alt='Regiment Of Renown' />
        <div id='column' className='Chapter'>
            {sortedRegimentsOfRenown && map(sortedRegimentsOfRenown, renderRegimentAlliance)}
        </div>
    </>
}

export default RegimentsOfRenownList