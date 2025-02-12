import React from 'react'

import map from 'lodash/map'

import Styles from './styles/RuFAQ.module.css'

const ruFAQ = require('../ruFAQ.json')

const RuFAQ = () => {

    const renderQuestion = (item) => <div id={Styles.container}>
        <p id={Styles.question}>Q: {item.question}</p>
        <p id={Styles.answer}>A: {item.answer}</p>
    </div>

    return <div id='column' className='Chapter'>
        {map(ruFAQ.data, renderQuestion)}
    </div>
}

export default RuFAQ