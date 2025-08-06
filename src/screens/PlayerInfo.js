import React, {useReducer, useState, useCallback, useEffect} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import Roster from '../components/Roster'
import RosterEasy from '../components/RosterEasy'
import Checkbox from '../components/Checkbox'
import Modal from '../components/Modal'
import FloatingLabelInput from '../components/FloatingLabelInput'
import {players, player as _player, rosterViewType} from '../utilities/appState'

import map from 'lodash/map'
import get from 'lodash/get'
import find from 'lodash/find'
import size from 'lodash/size'

import Styles from './styles/PlayerInfo.module.css'

const FOLDER_ID = process.env.REACT_APP_FOLDER_ID
const API_KEY = process.env.REACT_APP_API_KEY

const PlayerInfo = () => {
    console.log({processEnv: process.env, API_KEY, FOLDER_ID})
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const {player} = useLocation().state
    const rosterInfo = JSON.parse(player.roster_stat)
    const roster = JSON.parse(player.roster)
    const [modalData, setModalData] = useState({visible: false, title: ''})
    const [isPlayerDrop, setIsPlayerDrop] = useState(false)
    const [isPlayerActive, setIsPlayerActive] = useState(Boolean(player?.status))
    const [message, setMessage] = useState('')
    const [photos, setPhotos] = useState([])

    const loadPhotos = useCallback(async () => {
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}`
        )
        const data = await response.json()
        const folder = find(data?.files, ['name', `${player.surname} ${player.name}`])
        if (folder?.id) {
            const responsePhotos = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${folder.id}'+in+parents&key=${API_KEY}`
            )
            const photosData = await responsePhotos.json()
            setPhotos(photosData?.files)
        }
    }, [player.surname, player.name])

    useEffect(() => {
        loadPhotos()
    }, [loadPhotos]) 

    const handleClickAllegiance = () => {
        navigate('/army', {state: {title: rosterInfo.allegiance, allegianceId: roster.allegianceId}})
    }

    const handleClickPlayer = (player) => () => {
        navigate('/playerInfo', {state: {player, title: `${player.surname} ${player.name}`}})
    }

    const handleChangeViewType = () => {
        rosterViewType.easy = !rosterViewType.easy
        forceUpdate()
    }

    const handleCloseModal = () => {
        setModalData({visible: false, title: '', text: ''})
    }

    const handleOpenDropModal = () => {
        setModalData({visible: true, title: 'Вы уверен, что хотите удалить игрока с турнира?', Content: renderDropModalConent})
    }

    const handleOpenStatusModal = () => {
        setModalData({visible: true, title: `Вы уверен, что изменить статус игрока на ${isPlayerActive ? '"Не активен"' : '"Активен"'}`, Content: renderStatusModalConent})
    }

    const handleDropPlayer = useCallback(async () => {
        handleCloseModal()
        await fetch(`https://aoscom.online/players/?tg_id=${player?.tgId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                setIsPlayerDrop(true)
                forceUpdate()
            })
            .catch(error => console.error(error))
      }, [player?.tgId])

    const handlChangeStatus = useCallback(async () => {
        handleCloseModal()
        await fetch(`https://aoscom.online/players/status/?tg_id=${player?.tgId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                setIsPlayerActive(!isPlayerActive)
                forceUpdate()
            })
            .catch(error => console.error(error))
      }, [player?.tgId, isPlayerActive])

    const handleSendMessage = useCallback(async () => {
        setMessage('')
        await fetch(`https://aoscom.online/messages/send_personal_message/?tg_id=${player?.tgId}&message=${message}`)
            .then(() => {
                forceUpdate()
            })
            .catch(error => console.error(error))
      }, [player?.tgId, message])

    const handleChangeMessage = (e) => {
        setMessage(e.target.value)
    }

    const renderDropModalConent = () => <div id={Styles.modal}>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет</button>
        <button id={Styles.modalButton} onClick={handleDropPlayer}>Да, удалить</button>
    </div>

    const renderStatusModalConent = () => <div id={Styles.modal}>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет</button>
        <button id={Styles.modalButton} onClick={handlChangeStatus}>Да, изменить</button>
    </div>

    const renderSendMessage = () => <div id={Styles.sendMessageContainer}>
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeMessage}
            label='Cообщение игроку (то бота)'
            value={message}
        />
        <button id={Styles.sendMessageButton} onClick={handleSendMessage}>Отправить</button>
    </div>

    const renderPlayRow = (number, player, result, to, isOddRow) => <div id={Styles.row} style={{'background': `${isOddRow ? '#ECECEC' : ''}`}}>
        <p id={Styles.extraSmallColumn}>{number}</p>
        <p id={Styles.сolumn}>{player}</p>
        <p id={Styles.smallColumn}>{result}</p>
        <p id={Styles.smallColumn}>{to || 0}</p>
    </div>

    const renderPlay = (playIndex, index) => {
        const oppId = get(player, `game_${playIndex}_opp`)
        const opponent = find(players.data, ['id', oppId])
        const tp = get(player, `game_${playIndex}_tp`)
        const gameResult = tp > 10 ? 'Win' : tp === 10 ? 'Draw' : tp === null ? '' : 'Lose'
        return opponent
            ? <button key={index} id={Styles.playContainer} onClick={handleClickPlayer(opponent)}>
                {renderPlayRow(playIndex, `${opponent.surname} ${opponent.name}`, gameResult, tp, index % 2)}
            </button>
            : null
    }

    const renderPhotos = (photo) => {
        const src = `https://www.googleapis.com/drive/v3/files/${photo.id}?alt=media&key=${API_KEY}`
        return <img 
            key={photo.id}
            src={src}
            alt={photo.name}
            width={360}
            height={196}
            loading="lazy"
        />
    }
    
    return <div id='column' className='Chapter'>
        {isPlayerDrop ? <p id={Styles.isPlayerDrop}>Игрок удалён с турнира</p> : null}
        {_player.isJudge
            ? <p id={Styles.title}>Статус игрока: <b>{isPlayerActive ? 'Активен' : 'Не активен'}</b></p>
            : null
        }
        <p id={Styles.title}><b>Город:</b> {player.city}</p>
        <p id={Styles.title}><b>Гранд Альянс:</b> {rosterInfo?.grandAlliance}</p>
        <p id={Styles.title}><b>Армия:</b> {rosterInfo?.allegiance}</p>
        {player.game_1_opp
            ? <>
                <b id={Styles.title}>Игры</b>
                    <div id={Styles.tableContainer}>
                    {renderPlayRow('№', 'Оппонент', 'Результат', 'ТО', true)}
                    {map([1, 2, 3, 4, 5], renderPlay)}
                </div>
            </>
            : null
        }
        {roster
            ? <>
                <b id={Styles.title}>Ростер</b>
                <div id={Styles.checkboxContainer} onClick={handleChangeViewType}>
                    <p id={Styles.checkboxText}>Easy View</p>
                    <Checkbox onClick={handleChangeViewType} checked={rosterViewType.easy} />
                </div>
                {rosterViewType.easy
                    ? <RosterEasy roster={roster} info={rosterInfo} />
                    : <Roster roster={roster} info={rosterInfo} />
                }
                <button id={Styles.rulesButton} onClick={handleClickAllegiance}>Правила Армии</button>
            </>
            : null
        }
        {size(photos)
            ? <>
                <p id={Styles.title}><b>Фото Армии</b></p>
                <div style={{display: 'flex', overflowX: 'auto', gap: '12px'}}>
                    {map(photos, renderPhotos)}
                </div>
            </>
            : null
        }
        {_player.isJudge
            ? <> 
                <button id={Styles.rulesButton} onClick={handleOpenStatusModal}>Изменить статус игрока на {isPlayerActive ? '"Не активен"' : '"Активен"'}</button>
                <button id={Styles.rulesButton} onClick={handleOpenDropModal}>Удалить игрока с турнира</button>
                {renderSendMessage()}
            </>
            : null
        }
        <Modal {...modalData} onClose={handleCloseModal} />
    </div>
}

export default PlayerInfo

const inputStyle = {
    '--Input-minHeight': '48px',
    'width': '100%',
    'borderRadius': '4px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}