import React from 'react';
import Constants from '../Constants'
import ImageCard from '../components/ImageCard'
import MenuRow from '../components/MenuRow'
import {SectionTitle} from '../components/ListCard'

import map from 'lodash/map'

const MainRules = () => {
    const renderRow = (grandAlliance) => <ImageCard
        key={grandAlliance.id}
        title={grandAlliance.name}
        image={grandAlliance.image}
        size='lg'
        navigateTo='catalog'
        state={{grandAlliance}}
    />

    return <div id='column' className='Chapter'>
        <SectionTitle>Armies</SectionTitle>
        {map(Constants.grandAlliances, renderRow)}
        <SectionTitle>Library</SectionTitle>
        <MenuRow title='Core Documents' text="Core rules, General's Handbook, battlepacks" navigateTo='coreDocuments' />
        <MenuRow title='Regiments of Renown' text='Mercenary regiments for any army' navigateTo='regimentOfRenownList' />
        <MenuRow title='Manifestations' text='Endless spells and their lores' navigateTo='manifestations' />
        <MenuRow title='Legends' text='Warscrolls no longer in the core range' navigateTo='legends' />
    </div>
}

export default MainRules
