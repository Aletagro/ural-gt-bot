import React, {useMemo, useState} from 'react'
import {getArmyImage} from '../utilities/utils'
import {leadersView} from '../utilities/appState'
import Constants from '../Constants'


import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import reduce from 'lodash/reduce'

import Styles from './styles/AllianceTop.module.css'

const TOP_N = 5

const parseStat = (player) => {
    try {
        return JSON.parse(player.roster_stat) || {}
    } catch (e) {
        return {}
    }
}

const AllianceTop = ({standing, leaderId, onOpen}) => {
    const tops = useMemo(() => {
        const rest = (standing || []).filter((p) => p.id !== leaderId)
        return reduce(Constants.grandAlliances, (acc, alliance) => {
            acc[alliance.name] = rest.filter((p) => parseStat(p).grandAlliance === alliance.name).slice(0, TOP_N)
            return acc
        }, {})
    }, [standing, leaderId])

    const [active, setActive] = useState(() =>
        (Constants.grandAlliances[leadersView.alliance] ? leadersView.alliance : null)
        || find(Constants.grandAlliances, (a) => size(tops[a.name]))?.name
        || Constants.grandAlliances[0].name
    )

    const handleSelectAlliance = (name) => () => {
        leadersView.alliance = name
        setActive(name)
    }
    const accent = Constants.grandAlliances[active]?.color

    return <div className={Styles.container} style={{'--accent': accent}}>
        <div className={Styles.tabs}>
            {map(Constants.grandAlliances, (alliance) =>
                <button
                    key={alliance.id}
                    className={`${Styles.tab} ${alliance.name === active ? Styles.tabActive : ''}`}
                    style={{'--tab-accent': Constants.grandAlliances[alliance.name]?.color}}
                    onClick={handleSelectAlliance(alliance.name)}
                >
                    {alliance.name}
                </button>
            )}
        </div>

        {size(tops[active])
            ? map(tops[active], (player, index) => {
                const allegiance = parseStat(player).allegiance
                const src = getArmyImage(allegiance)
                return <button key={player.id} className={Styles.row} onClick={onOpen(player)}>
                    <span className={Styles.rank}>{index + 1}</span>
                    {src
                        ? <img className={Styles.thumb} src={src} alt={allegiance} />
                        : <span className={Styles.thumb} />
                    }
                    <span className={Styles.info}>
                        <span className={Styles.name}>{player.surname} {player.name}</span>
                        <span className={Styles.sub}>{allegiance}</span>
                        <span className={Styles.sub}>#{player.place} в турнире</span>
                    </span>
                    <span className={Styles.points}>{player.tp_sum}{Constants.noBreakSpace}ТО</span>
                </button>
            })
            : <p className={Styles.empty}>В этом Альянсе пока никого</p>
        }
    </div>
}

export default AllianceTop
