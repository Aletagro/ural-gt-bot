import React from 'react'
import StatsSection, {WdlBar, getAllianceColor, fmt} from './StatsSection'

import map from 'lodash/map'

import Styles from './styles/GamesBlocks.module.css'

// alliances: результат calcGrandAllianceStats
const GrandAllianceCards = ({alliances}) => <StatsSection
    title='Гранд Альянсы'
    hint='Игры внутри одного Альянса не учитываются'
>
    <div className={Styles.allianceGrid}>
        {map(alliances, (alliance) => {
            return <div
                key={alliance.name}
                className={Styles.allianceCard}
                style={{'--accent': getAllianceColor(alliance.name)}}
            >
                <div className={Styles.allianceHead}>
                    <span className={Styles.allianceName}>{alliance.name}</span>
                </div>

                {alliance.games
                    ? <>
                        <p className={Styles.winRate}>{alliance.winRate}%</p>
                        <p className={Styles.winRateLabel}>винрейт / игр {alliance.games}</p>
                        <WdlBar wins={alliance.wins} draws={alliance.draws} losses={alliance.losses} />
                        <p className={Styles.wdlText}>{alliance.wins}–{alliance.draws}–{alliance.losses}</p>
                        <p className={Styles.metrics}>ТО {fmt(alliance.avgTp)} / VP {fmt(alliance.avgVp)}</p>
                    </>
                    : <p className={Styles.noData}>Пока нет игр против других Альянсов</p>
                }

                {alliance.internalGames
                    ? <p className={Styles.internal}>Игр внутри Альянса: {alliance.internalGames}</p>
                    : null
                }
            </div>
        })}
    </div>
</StatsSection>

export default GrandAllianceCards
