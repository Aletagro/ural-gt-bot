import React from 'react'

import {joinNames} from '../utilities/gamesCalc'

import Styles from './styles/RosterBlocks.module.css'

const Fact = ({title, children}) => <div className={Styles.fact}>
    <p className={Styles.factTitle}>{title}</p>
    <p className={Styles.factText}>{children}</p>
</div>

// facts = calcFacts(games, sides). Показываем только те факты, которые удалось посчитать
const FactsBlock = ({facts}) => {
    const {winStreak, biggestWin, topVp, hardestPath} = facts
    if (!winStreak && !biggestWin && !topVp && !hardestPath) return null

    return <section className={Styles.section}>
        <p className={Styles.sectionTitle}>Интересные факты</p>

        {winStreak
            ? <Fact title='Самая длинная серия побед'>
                <b>{winStreak.length} подряд</b>: {joinNames(winStreak.names)}
            </Fact>
            : null
        }

        {biggestWin
            ? <Fact title='Самая крупная победа по VP'>
                <b>+{biggestWin.diff} VP</b>
                {biggestWin.games.slice(0, 3).map((g) =>
                    <span key={`${g.round}-${g.winner}`} className={Styles.factLine}>
                        {g.winner} {g.winnerVp}:{g.loserVp} {g.loser}, раунд {g.round}
                    </span>
                )}
            </Fact>
            : null
        }

        {topVp
            ? <Fact title='Больше всего VP за игру'>
                <b>{topVp.vp} VP</b>
                {topVp.items.slice(0, 3).map((item) =>
                    <span key={`${item.round}-${item.name}`} className={Styles.factLine}>
                        {item.name} против {item.opponent}, раунд {item.round}
                    </span>
                )}
            </Fact>
            : null
        }

        {hardestPath
            ? <Fact title='Самый сложный путь'>
                <b>{hardestPath.value} ТО</b> у соперников: {joinNames(hardestPath.names)}
            </Fact>
            : null
        }
    </section>
}

export default FactsBlock
