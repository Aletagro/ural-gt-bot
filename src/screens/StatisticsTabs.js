import React, {useState} from 'react'
import {meta} from '../utilities/appState'
import RostersStats from './Statistics'
import GamesStats from './GamesStats'

import map from 'lodash/map'

import Styles from './styles/StatisticsTabs.module.css'

const TABS = [
    {key: 'rosters', title: 'Ростеры'},
    {key: 'games', title: 'Игры'},
]

const StatisticsTabs = () => {
    const [tab, setTab] = useState('rosters')
    const hasResult = !meta.round

    return <div id='column' className='Chapter'>
        {hasResult
            ? <div className={Styles.tabs}>
                {map(TABS, (item) =>
                    <button
                        key={item.key}
                        className={`${Styles.tab} ${tab === item.key ? Styles.tabActive : ''}`}
                        onClick={() => setTab(item.key)}
                    >
                        {item.title}
                    </button>
                )}
            </div>
            : null
        }
        {tab === 'games' ? <GamesStats /> : <RostersStats />}
    </div>
}

export default StatisticsTabs