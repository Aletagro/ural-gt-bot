import React, {forwardRef} from 'react'
import map from 'lodash/map'

import Constants from '../Constants'
import {getArmyImage} from '../utilities/utils'
import {TOURNAMENT_NAME, pickShareBadges, getPlaceTitle} from '../utilities/playerShareText'

import Styles from './styles/PlayerShare.module.css'

// Картинка для шеринга. Рисуется за пределами экрана и снимается через html2canvas,
// поэтому размер фиксированный (360x450, то есть 1080x1350 при scale 3)
const PlayerShareCard = forwardRef(({card, isFinished}, ref) => {
    const image = getArmyImage(card.allegiance)
    const color = Constants.grandAlliances[card.grandAlliance]?.color
    const placeTitle = getPlaceTitle(card.place, isFinished)
    const badges = pickShareBadges(card.badges.earned)
    const {record} = card

    return <div ref={ref} className={Styles.card} style={color ? {'--accent': color} : undefined}>
        {image ? <img className={Styles.image} src={image} alt='' /> : null}
        <div className={Styles.shade} />

        <div className={Styles.top}>
            <p className={Styles.brand}>{TOURNAMENT_NAME}</p>
            {placeTitle ? <span className={Styles.pill}>{placeTitle}</span> : null}
        </div>

        <div className={Styles.bottom}>
            <p className={Styles.name}>{card.fullName}</p>
            {card.allegiance ? <p className={Styles.army}>{card.allegiance}</p> : null}

            <div className={Styles.stats}>
                {card.place
                    ? <div className={Styles.stat}>
                        <span className={Styles.statValue}>{card.place}</span>
                        <span className={Styles.statLabel}>из {card.total}</span>
                    </div>
                    : null
                }
                <div className={Styles.stat}>
                    <span className={Styles.statValue}>{card.tpSum}</span>
                    <span className={Styles.statLabel}>ТО</span>
                </div>
                <div className={Styles.stat}>
                    <span className={Styles.statValue}>{record.wins}-{record.draws}-{record.losses}</span>
                    <span className={Styles.statLabel}>В-Н-П</span>
                </div>
            </div>

            {badges.length
                ? <div className={Styles.badges}>
                    {map(badges, (badge) =>
                        <span key={badge.id} className={Styles.badge}>
                            <span className={Styles.badgeIcon}>{badge.icon}</span>
                            {badge.title}
                        </span>
                    )}
                </div>
                : null
            }
        </div>
    </div>
})

export default PlayerShareCard
