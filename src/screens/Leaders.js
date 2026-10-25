import React, {useReducer, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {players, player as _player} from '../utilities/appState'
import {getChampions, getArmyImage} from '../utilities/utils'
import SecondaryNominations from '../components/SecondaryNominations'
import AllianceTop from '../components/AllianceTop'
import YourPlace from '../components/YourPlace'
import Constants from '../Constants'

import map from 'lodash/map'
import find from 'lodash/find'

import Styles from './styles/Leaders.module.css'

const ALLIANCE_THEME = {
    Order: '#b8962e',
    Chaos: '#c0392b',
    Death: '#8e6bbf',
    Destruction: '#3f9d47',
}

const ArmyImage = ({allegiance, className}) => {
    const src = getArmyImage(allegiance)
    return src
        ? <img className={className} src={src} alt={allegiance} />
        : <div className={className} />
}

const Leaders = () => {
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    useEffect(() => {
        fetch(`${Constants.domain}/players/ranking`)
            .then(response => response.json())
            .then(data => {
                const _players = map(data.players, (_player, index) => ({..._player, place: index + 1}))
                players.standing = _players
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

    const {leader, byAlliance} = {...getChampions(players.standing)}
    const leaderAllegiance = leader ? JSON.parse(leader.roster_stat)?.allegiance : undefined

    const openPlayer = (entry) => () => {
        const player = find(players?.data, ['id', entry.id])
        if (!player) return
        navigate('/playerInfo', {state: {player, title: `${player.surname} ${player.name}`}})
    }

    if (!leader) {
        return <div id='column' className='Chapter'>
            <p className={Styles.empty}>Лидеры появятся после первого раунда</p>
        </div>
    }

    return <div id='column' className='Chapter'>
        <YourPlace standing={players.standing} playerId={_player?.info?.id} onOpen={openPlayer} />
        <button className={Styles.leader} onClick={openPlayer(leader)}>
            <p className={Styles.leaderLabel}>Лидер турнира</p>
            <ArmyImage allegiance={leaderAllegiance} className={Styles.leaderImage} />
            <p className={Styles.leaderName}>{leader.surname} {leader.name}</p>
            <p className={Styles.army}>{leaderAllegiance}</p>
            <p className={Styles.leaderPoints}>{leader.tp_sum} ТО</p>
        </button>

        <p className={Styles.sectionTitle}>Лучшие в Гранд Альянсах</p>
        <div className={Styles.grid}>
            {map(byAlliance, ({alliance, player}) => {
                const playerAllegiance = player ? JSON.parse(player.roster_stat)?.allegiance : undefined
                return <button
                    key={alliance}
                    className={Styles.champion}
                    style={{'--accent': ALLIANCE_THEME[alliance]}}
                    onClick={player ? openPlayer(player) : undefined}
                    disabled={!player}
                >
                    <p className={Styles.alliance}>{alliance}</p>
                    {player
                        ? <>
                            <ArmyImage allegiance={playerAllegiance} className={Styles.championImage} />
                            <p className={Styles.name}>{player.surname} {player.name}</p>
                            <p className={Styles.army}>{playerAllegiance} {player.tp_sum}{Constants.noBreakSpace}ТО</p>
                        </>
                        : <p className={Styles.none}>Пока никого</p>
                    }
                </button>
            })}
        </div>
        <p className={Styles.sectionTitle}>Топ-5 по Альянсам</p>
        <AllianceTop
            standing={players.standing}
            leaderId={leader.id}
            themes={ALLIANCE_THEME}
            onOpen={openPlayer}
        />
        {console.log(_player)}
        {_player?.isJudge
            ? <SecondaryNominations standing={players.standing} onOpen={openPlayer} />
            : null
        }
    </div>
}

export default Leaders
