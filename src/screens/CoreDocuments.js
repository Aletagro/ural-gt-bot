import React from 'react';
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Constants from '../Constants'
import {sortByName} from '../utilities/utils'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

const dataBase = require('../dataBase.json')

const CoreDocuments = () => {
    const documentsIds = filter(dataBase.data.publication_publication_group, publication => includes([Constants.coreDocumentsId, Constants.ghbId], publication.publicationGroupId) && publication.publicationId !== Constants.manifestationsPublicationId)
    let documents = map(documentsIds, ({publicationId}) => find(dataBase.data.publication, ['id', publicationId]))
    documents = sortByName(documents)

    const renderRow = (document) => <Row
        key={document.id}
        title={document.name}
        navigateTo='ruleSections'
        state={{document}}
    />

    // const renderRuFAQRow = () => <Row
    //     title='Arrow City FAQ'
    //     navigateTo='ruFAQ'
    // />

    return <>
        <HeaderImage src={Constants.rulesImage} alt='Core Documents' />
        <div id='column' className='Chapter'>
            {documents && map(documents, renderRow)}
            {/* {renderRuFAQRow()} */}
        </div>
    </>
}

export default CoreDocuments