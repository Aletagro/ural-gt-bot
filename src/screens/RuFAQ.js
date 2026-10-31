import React from 'react'

import map from 'lodash/map'

import Styles from './styles/RuFAQ.module.css'

const ruFAQ = require('../ruFAQ.json')

const RuFAQ = () => {

    const renderQuestion = (item, index) => <div id={Styles.container} key={item.id ?? index}>
        <p id={Styles.question}><span className={Styles.mark}>Q</span><span>{item.question}</span></p>
        <p id={Styles.answer}><span className={`${Styles.mark} ${Styles.markAnswer}`}>A</span><span>{item.answer}</span></p>
    </div>

    return <div id='column' className='Chapter'>
        {map(ruFAQ.data, renderQuestion)}
    </div>
}

export default RuFAQ