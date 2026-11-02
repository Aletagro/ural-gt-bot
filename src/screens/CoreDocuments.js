import React from 'react';
import {ListCard, ListItem} from '../components/ListCard'
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

    const renderRow = (document) => <ListItem
        key={document.id}
        title={document.name}
        navigateTo='ruleSections'
        state={{document}}
    />

    // const renderRuFAQRow = () => <Row
    //     title='Arrow City FAQ'
    //     navigateTo='ruFAQ'
    // />

    return <div id='column' className='Chapter'>
        <ListCard>
            {documents && map(documents, renderRow)}
        </ListCard>
        {/* {renderRuFAQRow()} */}
    </div>
}

export default CoreDocuments