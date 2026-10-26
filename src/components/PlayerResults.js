import React from 'react'
import map from 'lodash/map'

import Styles from './styles/PlayerCard.module.css'

const Tile = ({value, label, hint}) => <div className={Styles.tile}>
    <p className={Styles.tileValue}>{value}</p>
    <p className={Styles.tileLabel}>{label}</p>
    {hint ? <p className={Styles.tileHint}>{hint}</p> : null}
</div>

// Плашка с местом и плитки с результатами. Показываем только то, что удалось посчитать
const PlayerResults = ({card}) => {
    const {place, total, record, tpSum, vpSum, avgVp, streak, bestWin, path} = card

    if (!record.games && !place) return null

    const tiles = []
    if (avgVp !== null) tiles.push({key: 'avgVp', value: avgVp, label: 'Средний VP', hint: `всего ${vpSum} VP`})
    if (streak >= 2) tiles.push({key: 'streak', value: streak, label: 'Серия побед', hint: 'подряд'})
    if (bestWin) tiles.push({key: 'bestWin', value: `+${bestWin.diff} VP`, label: 'Лучшая победа', hint: `раунд ${bestWin.round}, ${bestWin.opponent}`})
    if (path) tiles.push({key: 'path', value: path.value, label: 'Сложность пути', hint: path.rank ? `${path.rank}-й по турниру` : null})

    return <>
        <div className={Styles.placeBox}>
            {place
                ? <div className={Styles.placeNumber}>
                    <span className={Styles.placeNumberValue}>{place}</span>
                    <span className={Styles.placeNumberOf}>из {total}</span>
                </div>
                : null
            }
            <div>
                <p className={Styles.placeLabel}>Место в турнире</p>
                <p className={Styles.placeTp}>{tpSum} ТО</p>
                <p className={Styles.placeNote}>
                    {record.wins}-{record.draws}-{record.losses} (победы, ничьи, поражения)
                </p>
            </div>
        </div>
        {tiles.length
            ? <div className={Styles.tiles}>
                {map(tiles, (tile) => <Tile key={tile.key} {...tile} />)}
            </div>
            : null
        }
    </>
}

export default PlayerResults
