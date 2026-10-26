import React from 'react'

import map from 'lodash/map'

import Styles from './styles/RosterBlocks.module.css'

// Таблица по раундам: сколько игр сыграно, средний VP, разница VP, ничьи
const RoundsStats = ({rounds}) => {
    if (!rounds.length) return null

    return <section className={Styles.section}>
        <p className={Styles.sectionTitle}>По раундам</p>
        <div className={`${Styles.roundsRow} ${Styles.roundsHead}`}>
            <span>Раунд</span>
            <span>Ср. VP</span>
            <span>Разница VP</span>
            <span>Ничьи</span>
        </div>
        {map(rounds, (row) =>
            <div key={row.round} className={Styles.roundsRow}>
                <span className={Styles.roundNumber}>{row.round}</span>
                <span>{row.avgVp ?? '–'}</span>
                <span>{row.avgVpDiff ?? '–'}</span>
                <span>{row.draws ? `${row.draws} (${row.drawsPercent}%)` : '–'}</span>
            </div>
        )}
        <p className={Styles.sectionHint}>Ср. VP — за игру одним игроком, разница VP — между соперниками</p>
    </section>
}

export default RoundsStats
