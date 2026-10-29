import React from 'react'
import {MIN_GAMES_FOR_RATING} from '../utilities/gamesCalc'
import StatsSection, {getAllianceColor, getAllianceShortName} from './StatsSection'

import map from 'lodash/map'

import Styles from './styles/GamesBlocks.module.css'

// Выше 50%: золотой, ниже: сине-серый. Насыщенность растёт с отрывом от 50%
const getCellBackground = (cell) => {
    if (!cell.games || cell.winRate === null) return '#f3f3f3'
    const strength = Math.min(Math.abs(cell.winRate - 50) / 50, 1)
    const alpha = 0.1 + strength * 0.55
    return cell.winRate >= 50 ? `rgba(184, 150, 46, ${alpha})` : `rgba(90, 110, 140, ${alpha})`
}

// matrix: результат calcMatchupMatrix
const MatchupMatrix = ({matrix}) => <StatsSection
    title='Альянс против Альянса'
    hint='Строка против колонки: доля побед игроков Альянса из строки над Альянсом из колонки. На диагонали число игр внутри Альянса'
>
    <div className={Styles.matrix}>
        <div />
        {map(matrix.alliances, (name) =>
            <div key={name} className={Styles.matrixColTitle} style={{color: getAllianceColor(name)}}>
                {getAllianceShortName(name)}
            </div>
        )}

        {map(matrix.cells, (row, rowIndex) => {
            const rowName = matrix.alliances[rowIndex]
            return <React.Fragment key={rowName}>
                <div className={Styles.matrixRowTitle} style={{color: getAllianceColor(rowName)}}>
                    {getAllianceShortName(rowName)}
                </div>
                {map(row, (cell, colIndex) => {
                    if (cell.isDiagonal) {
                        return <div key={colIndex} className={`${Styles.matrixCell} ${Styles.matrixDiagonal}`}>
                            {cell.games ? <span className={Styles.cellGames}>{cell.games} игр</span> : '/'}
                        </div>
                    }
                    const isSmall = cell.games > 0 && cell.games < MIN_GAMES_FOR_RATING
                    return <div
                        key={colIndex}
                        className={Styles.matrixCell}
                        style={{background: getCellBackground(cell), opacity: isSmall ? 0.6 : 1}}
                    >
                        {cell.games
                            ? <>
                                <span className={Styles.cellValue}>{cell.winRate}%</span>
                                <span className={Styles.cellGames}>{cell.games} игр</span>
                            </>
                            : <span className={Styles.cellGames}>–</span>
                        }
                    </div>
                })}
            </React.Fragment>
        })}
    </div>
</StatsSection>

export default MatchupMatrix
