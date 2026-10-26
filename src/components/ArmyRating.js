import React, {useMemo, useState} from 'react'
import {getArmyImage} from '../utilities/utils'
import {sortArmies} from '../utilities/gamesCalc'
import StatsSection, {WdlBar, getAllianceColor, fmt} from './StatsSection'

import map from 'lodash/map'

import Styles from './styles/GamesBlocks.module.css'

const SORTS = [
    {key: 'winRate', title: 'Винрейт'},
    {key: 'avgTp', title: 'Ср. ТО'},
    {key: 'avgVp', title: 'Ср. VP'},
    {key: 'games', title: 'Игр'},
]
const COLLAPSED_COUNT = 8

// armies: результат calcArmyStats
const ArmyRating = ({armies}) => {
    const [sortKey, setSortKey] = useState('winRate')
    const [expanded, setExpanded] = useState(false)

    const sorted = useMemo(() => sortArmies(armies, sortKey), [armies, sortKey])
    const shown = expanded ? sorted : sorted.slice(0, COLLAPSED_COUNT)

    return <StatsSection
        title='Армии'
        hint={`Без учёта зеркальных игр`}
    >
        {sorted.length
            ? <>
                <div className={Styles.sortChips}>
                    {map(SORTS, (sort) =>
                        <button
                            key={sort.key}
                            className={`${Styles.chip} ${sortKey === sort.key ? Styles.chipActive : ''}`}
                            onClick={() => setSortKey(sort.key)}
                        >
                            {sort.title}
                        </button>
                    )}
                </div>

                {map(shown, (army) => {
                    const src = getArmyImage(army.name)
                    return <div key={army.name} className={`${Styles.armyRow} ${army.isSmall ? Styles.armyRowSmall : ''}`}>
                        {src ? <img className={Styles.armyThumb} src={src} alt={army.name} /> : <span className={Styles.armyThumb} />}
                        <div className={Styles.armyBody}>
                            <div className={Styles.armyHead}>
                                <span className={Styles.armyName}>
                                    <span className={Styles.dot} style={{background: getAllianceColor(army.grandAlliance)}} />
                                    {army.name}
                                </span>
                                <span className={Styles.armyWinRate}>{fmt(army.winRate === null ? null : `${army.winRate}%`)}</span>
                            </div>
                            <WdlBar wins={army.wins} draws={army.draws} losses={army.losses} />
                            <p className={Styles.armyMetrics}>
                                Игр {army.games} / {army.wins}–{army.draws}–{army.losses} / ТО {fmt(army.avgTp)} / VP {fmt(army.avgVp)}
                            </p>
                        </div>
                    </div>
                })}

                {sorted.length > COLLAPSED_COUNT
                    ? <button className={Styles.moreButton} onClick={() => setExpanded(!expanded)}>
                        {expanded ? 'Свернуть' : `Показать все (${sorted.length})`}
                    </button>
                    : null
                }
            </>
            : <p className={Styles.noData}>Пока нет игр между разными армиями</p>
        }
    </StatsSection>
}

export default ArmyRating
