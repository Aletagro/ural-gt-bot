import React from 'react';
import {useLocation} from 'react-router-dom'
import {replaceAsterisks, sortByName} from '../utilities/utils'
import BattleTactic from '../components/BattleTactic'

import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

import Styles from './styles/Tactic.module.css'

const dataBase = require('../dataBase.json')

const Tactic = () => {
    const {tactic} = useLocation().state
    const data = filter(dataBase.data.rule_container_component, (component) => component.ruleContainerId === tactic.id)
    sortByName(data, 'displayOrder')

    const renderBattleTactic = (id) => {
        const battleTactic = find(dataBase.data.battle_tactic, ['id', id])
        return <BattleTactic key={battleTactic.id} tactic={battleTactic}/>
    }

    const renderItem = (item) => {
        if (item.contentType === 'text') {
            return <p id={Styles.text} key={item.id}>{replaceAsterisks(item.textContent)}</p>
        } else if (item.contentType === 'battleTactic') {
            return renderBattleTactic(item.battleTacticId)
        }
        return null
    }

    return <div id='column' className='Chapter'>
        {tactic.containerType === 'standard'
            ? map(data, renderItem)
            : <p id={Styles.text}>{replaceAsterisks(data[0]?.textContent)}</p>
        }
    </div>
}

export default Tactic