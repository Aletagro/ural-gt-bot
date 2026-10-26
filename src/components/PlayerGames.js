import React from 'react'
import map from 'lodash/map'

import {getArmyImage} from '../utilities/utils'

import Styles from './styles/PlayerCard.module.css'

const OUTCOME = {
    win: {label: 'Победа', color: '#4a8a3a'},
    draw: {label: 'Ничья', color: '#8a8a8a'},
    loss: {label: 'Поражение', color: '#b5453a'},
}

const GameRow = ({game, onOpenPlayer}) => {
    const {round, table, opponent, tp, vp, oppVp, outcome} = game
    const result = outcome ? OUTCOME[outcome] : null
    const image = opponent ? getArmyImage(opponent.allegiance) : null
    const isClickable = Boolean(opponent)

    const content = <>
        <span className={Styles.gameRound}>{round}</span>
        {image ? <img className={Styles.gameThumb} src={image} alt='' /> : <span className={Styles.gameThumbEmpty} />}
        <div className={Styles.gameBody}>
            <p className={Styles.gameName}>{opponent ? opponent.fullName : 'Соперник не найден'}</p>
            <p className={Styles.gameSub}>
                {[opponent?.allegiance, table ? `стол ${table}` : null].filter(Boolean).join(' · ')}
            </p>
        </div>
        <div className={Styles.gameResult}>
            {result
                ? <>
                    <p className={Styles.gameOutcome}>{result.label}</p>
                    <p className={Styles.gameTp}>{tp} ТО</p>
                    {vp !== null && oppVp !== null ? <p className={Styles.gameVp}>{vp}:{oppVp} VP</p> : null}
                </>
                : <span className={Styles.gamePending}>Идёт игра</span>
            }
        </div>
    </>

    const style = {'--result': result ? result.color : '#b0953f'}

    return isClickable
        ? <button className={`${Styles.game} ${Styles.gameButton}`} style={style} onClick={onOpenPlayer(opponent.player)}>{content}</button>
        : <div className={Styles.game} style={style}>{content}</div>
}

// rounds = card.rounds. onOpenPlayer(player) => () => переход на карточку соперника
const PlayerGames = ({rounds, onOpenPlayer}) => {
    if (!rounds.length) return null

    return <div>
        <div className={Styles.sectionHead}>
            <p className={Styles.sectionTitle}>Игры</p>
        </div>
        {map(rounds, (game) => <GameRow key={game.round} game={game} onOpenPlayer={onOpenPlayer} />)}
    </div>
}

export default PlayerGames
