import React from 'react';
import Constants from '../Constants'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import malekith from '../images/malekith.png'

import map from 'lodash/map'

const MainRules = () => {
    const renderRow = (grandAlliance) => <Row
        key={grandAlliance.id}
        title={grandAlliance.name}
        navigateTo='catalog'
        state={{grandAlliance}}
    />

    return <>
        <HeaderImage src={malekith} alt='main' />
        <div id='column' className='Chapter'>
            <Row title='Core Documents' navigateTo='coreDocuments' />
            {map(Constants.grandAlliances, renderRow)}
            <Row title='Regiment Of Renown' navigateTo='regimentOfRenownList' />
            <Row title='Manifestations' navigateTo='manifestations' />
            <Row title='Legends' navigateTo='legends' />
        </div>
    </>
}

export default MainRules