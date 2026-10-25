import React from 'react'
import {getArmyImage} from '../utilities/utils'
import Constants from '../Constants'

import map from 'lodash/map'
import size from 'lodash/size'

import Styles from './styles/SecondaryNominations.module.css'

const MAX_TIED_SHOWN = 5

// Номинации, где побеждает максимальное значение поля.
// tieBreak: 'place' - при равенстве выигрывает тот, кто выше в рейтинге (один победитель)
//           'show'  - при равенстве показываем всех, решают судьи
const NOMINATIONS = [
    {key: 'paint', icon: '🎨', title: 'Победитель конкурса покраса', hint: 'По числу голосов', field: 'my_paint', tieBreak: 'show'},
    {key: 'sport', icon: '🤝', title: 'Самый приятный оппонент', hint: 'По числу голосов, при равенстве выигрывает тот, кто выше в рейтинге', field: 'my_sport', tieBreak: 'place'},
    {key: 'path', icon: '⚔️', title: 'Самый сложный турнирный путь', hint: 'По сумме ТО оппонентов', field: 'opp_p', tieBreak: 'show'},
]

const parseStat = (player) => {
    try {
        return JSON.parse(player.roster_stat) || {}
    } catch (e) {
        return {}
    }
}

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null
    const number = Number(value)
    return Number.isNaN(number) ? null : number
}

// Все, у кого максимальное значение. Порядок как в рейтинге, то есть первый - с лучшим местом
const getTopByField = (standing, field) => {
    const scored = standing
        .map((player) => ({player, value: toNumber(player[field])}))
        .filter((item) => item.value !== null)
    if (!size(scored)) return []
    const max = Math.max(...map(scored, 'value'))
    if (max <= 0) return []
    return scored.filter((item) => item.value === max)
}

const Row = ({player, value, showPlace, onOpen}) => {
    const allegiance = parseStat(player).allegiance
    const src = getArmyImage(allegiance)
    return <button className={Styles.row} onClick={onOpen(player)}>
        {src
            ? <img className={Styles.thumb} src={src} alt={allegiance} />
            : <span className={Styles.thumb} />
        }
        <span className={Styles.info}>
            <span className={Styles.name}>{player.surname} {player.name}</span>
            <span className={Styles.sub}>{allegiance}{showPlace ? ` #${player.place}` : ''}</span>
        </span>
        <span className={Styles.value}>{value}</span>
    </button>
}

const Nomination = ({icon, title, hint, items, note, onOpen}) => {
    const shown = items.slice(0, MAX_TIED_SHOWN)
    const hidden = size(items) - size(shown)
    return <div className={Styles.nomination}>
        <p className={Styles.nominationTitle}>{icon} {title}</p>
        <p className={Styles.hint}>{hint}</p>
        {size(items)
            ? <>
                {note ? <p className={Styles.tie}>{note}</p> : null}
                {map(shown, (item) => <Row key={item.player.id} onOpen={onOpen} {...item} />)}
                {hidden > 0 ? <p className={Styles.tie}>и ещё {hidden}</p> : null}
            </>
            : <p className={Styles.empty}>Пока нет данных</p>
        }
    </div>
}

const SecondaryNominations = ({standing, onOpen}) => {
    const list = standing || []

    // Последнее место среди активных игроков (status как в PlayerInfo: Boolean(status))
    const active = list.filter((p) => Boolean(p.status))
    const lastActive = size(active) > 1 ? active[size(active) - 1] : null
    const lastItems = lastActive
        ? [{player: lastActive, value: `${lastActive.tp_sum}${Constants.noBreakSpace}ТО`, showPlace: true}]
        : []

    return <div className={Styles.container}>
        <p className={Styles.title}>Номинации <span>видно только судьям</span></p>

        {map(NOMINATIONS, (nomination) => {
            const top = getTopByField(list, nomination.field)
            const decidedByPlace = nomination.tieBreak === 'place' && size(top) > 1
            const items = decidedByPlace ? top.slice(0, 1) : top
            let note = null
            if (decidedByPlace) note = `Равное число голосов, игроков: ${size(top)}. Выбран тот, кто выше в рейтинге`
            else if (size(top) > 1) note = `Ничья, игроков: ${size(top)}`
            return <Nomination
                key={nomination.key}
                icon={nomination.icon}
                title={nomination.title}
                hint={nomination.hint}
                items={items}
                note={note}
                onOpen={onOpen}
            />
        })}
        <Nomination
            icon='🎁'
            title='Последнее место'
            hint='среди активных игроков, утешительный приз'
            items={lastItems}
            onOpen={onOpen}
        />
    </div>
}

export default SecondaryNominations