import React from 'react'
import Constants from '../Constants'
import {replaceAsterisks, setTacticColor} from '../utilities/utils'

import includes from 'lodash/includes'

import Styles from './styles/Tactics.module.css'

const dataBase = require('../dataBase.json')

const Tactics = () => {
    const tactics = dataBase.data.rule_container_component.filter(
        (rule) => includes(Constants.tacticsIdsArray, rule.ruleContainerId)
    )

    const renderTactic = (tactic) => {
        const color = setTacticColor(tactic.textContent)
        return <button key={tactic.id} id={Styles.container} style={{border: `1px solid ${color}`}}>
            <b id={Styles.title} style={{background: color}}>{tactic.title}</b>
            <p id={Styles.text}>{replaceAsterisks(tactic.textContent)}</p>
        </button>
    }
    
    return <div id='column' className='Chapter'>
        {tactics && tactics.map(renderTactic)}
    </div>
}

export default Tactics