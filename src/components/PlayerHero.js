import React from 'react'

import Constants from '../Constants'
import {getArmyImage} from '../utilities/utils'

import Styles from './styles/PlayerCard.module.css'

const getPillText = (place, isFinished, grandAlliance) => {
    if (place === 1) return isFinished ? 'Чемпион турнира' : 'Лидер турнира'
    if (place) return `${place} место`
    return grandAlliance || ''
}

// Обложка карточки: арт армии, место и имя. Рамка в цвете Гранд Альянса
const PlayerHero = ({card, isFinished}) => {
    const image = getArmyImage(card.allegiance)
    const color = Constants.grandAlliances[card.grandAlliance]?.color
    const pillText = getPillText(card.place, isFinished, card.grandAlliance)

    return <div className={Styles.hero} style={color ? {'--accent': color} : undefined}>
        {image ? <img className={Styles.heroImage} src={image} alt={card.allegiance} /> : null}
        <div className={Styles.heroShade} />
        {pillText ? <span className={Styles.pill}>{pillText}</span> : null}
        <div className={Styles.heroBottom}>
            <p className={Styles.heroName}>{card.fullName}</p>
            {card.allegiance ? <p className={Styles.heroArmy}>{card.allegiance}</p> : null}
            <p className={Styles.heroMeta}>
                {[card.grandAlliance, card.city].filter(Boolean).join(' · ')}
            </p>
        </div>
    </div>
}

export default PlayerHero
