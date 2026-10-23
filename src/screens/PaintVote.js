import React, {useState, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {player, players} from '../utilities/appState'
import Constants from '../Constants'

import map from 'lodash/map'
import size from 'lodash/size'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'

import Styles from './styles/PaintVote.module.css'

const PaintVote = () => {
    const navigate = useNavigate()
    const data = filter(players.data, 'paint_photo_path')
    const [selectedPlayers, setSelectedPlayers] = useState([])

    const handleSelectCard = useCallback((playerId) => () => {
        setSelectedPlayers((prevSelected) => {
            if (prevSelected.includes(playerId)) {
                return prevSelected.filter(id => id !== playerId)
            }
            if (prevSelected.length >= 3) {
                return prevSelected
            }
            return [...prevSelected, playerId]
        })
    }, [])

    const isButtonDisabled = isEmpty(selectedPlayers)

    const handleClickVote = useCallback(async () => {
        let votesToSend = [...selectedPlayers]
        while (size(votesToSend) < 3) {
            votesToSend.push(0)
        }
        await fetch(`${Constants.domain}/vote/?user_id=${player?.info?.id}&v_type=paint&plrs=${votesToSend}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .catch(error => console.error(error))
        player.info.paint_voted = true
        navigate('/')
    }, [navigate, selectedPlayers])

    const renderItem = useCallback((item) => {
        const isSelected = includes(selectedPlayers, item.id)
        const url = `${Constants.domain}/${item.paint_photo_path}`
        const rosterInfo = item.roster_stat ? JSON.parse(item.roster_stat) : {}
        return <div 
            key={item.id}
            className={`${Styles.card} ${isSelected ? Styles.cardSelected : ''}`}
            onClick={handleSelectCard(item.id)}
        >
            <div id={Styles.imageContainer}>
                <img src={url} id={Styles.image} alt={item.name} />
                {isSelected && (
                <div id={Styles.checkBadge}>
                    {selectedPlayers.indexOf(item.id) + 1}
                </div>
                )}
                <div id={Styles.nameContainer}>
                    <span id={Styles.playerName}>{item.surname} {item.name}</span>
                    <span id={Styles.playerFaction}>Ironjaws{rosterInfo.allegiance}</span>
                </div>
            </div>
        </div>
    }, [selectedPlayers, handleSelectCard])

    return <div id={Styles.voteContainer}>
        <div id={Styles.headerInfo}>
            <p id={Styles.subtitle}>Выберите от 1 до 3 лучших армий турнира</p>
            <div id={Styles.counter}>Выбрано: <span>{selectedPlayers.length} / 3</span></div>
        </div>
        <div id={Styles.gridContainer}>
            {map(data, renderItem)}
        </div>
        <button 
            id={isButtonDisabled ? Styles.disabledSendButton : Styles.sendButton}
            disabled={isButtonDisabled}
            onClick={handleClickVote}
        >
            {isButtonDisabled ? 'Выберите хотя бы одну армию' : 'Проголосовать'}
        </button>
    </div>
}

export default PaintVote
