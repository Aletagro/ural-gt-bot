import React from 'react'
import {useLocation} from 'react-router-dom'

// import Styles from './styles/Players.module.css'

const PlayerInfo = () => {
    const {player} = useLocation().state
    
    return <div id='column' className='Chapter'>
        <p>Подробная инфа об игроке {player.surname}</p>
    </div>
}

export default PlayerInfo