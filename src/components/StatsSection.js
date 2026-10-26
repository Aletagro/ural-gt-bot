import React from 'react'

import Constants from '../Constants'

import Styles from './styles/GamesBlocks.module.css'

export const DEFAULT_COLOR = '#8a6d1f'

export const getAllianceColor = (name) => Constants.grandAlliances?.[name]?.color || DEFAULT_COLOR
export const getAllianceShortName = (name) =>
    Constants.grandAlliances?.[name]?.shortName || Constants.grandAlliances?.[name]?.name || name

// null -> прочерк
export const fmt = (value) => (value === null || value === undefined ? '–' : value)

// Полоска «победы / ничьи / поражения»
export const WdlBar = ({wins, draws, losses}) => {
    const total = wins + draws + losses
    if (!total) return null
    return <div className={Styles.wdl}>
        <div className={Styles.wdlWin} style={{width: `${(wins / total) * 100}%`}} />
        <div className={Styles.wdlDraw} style={{width: `${(draws / total) * 100}%`}} />
        <div className={Styles.wdlLoss} style={{width: `${(losses / total) * 100}%`}} />
    </div>
}

const StatsSection = ({title, hint, children}) => <section className={Styles.section}>
    <p className={Styles.sectionTitle}>{title}</p>
    {hint ? <p className={Styles.sectionHint}>{hint}</p> : null}
    {children}
</section>

export default StatsSection
