import React, {useReducer, useState, useCallback, useMemo} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import Roster from '../components/Roster'
import RosterEasy from '../components/RosterEasy'
import Checkbox from '../components/Checkbox'
import Modal from '../components/Modal'
import PhotoGallery from '../components/PhotoGallery'
import FloatingLabelInput from '../components/FloatingLabelInput'
import {players, player as _player, rosterViewType} from '../utilities/appState'
import {addDomainForUrl} from '../utilities/utils'

import map from 'lodash/map'
import get from 'lodash/get'
import find from 'lodash/find'
import noop from 'lodash/noop'
import size from 'lodash/size'

import Styles from './styles/PlayerInfo.module.css'

const PlayerInfo = () => {
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const {player} = useLocation().state
    const rosterInfo = player.roster_stat ? JSON.parse(player.roster_stat) : {}
    let roster = player.roster
        ? player.roster
        : find(players?.data, ['id', player.id])?.roster
    if (roster) {
        roster = JSON.parse(roster)
    }
    const playerInfo = find(players.data, ['id', player.id])
    const [modalData, setModalData] = useState({visible: false, title: ''})
    const [isPlayerDrop, setIsPlayerDrop] = useState(false)
    const [isPlayerActive, setIsPlayerActive] = useState(Boolean(playerInfo?.status))
    const [message, setMessage] = useState('')
    const [paintChecked, setPaintChecked] = useState(player.paint_checked)
    const photos = useMemo(() => map(playerInfo?.validation_photo_path, addDomainForUrl), [playerInfo?.validation_photo_path])

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
        await fetch(`${Constants.domain}/players/?id=${player?.id}`, {
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
      }, [player?.id])

    const handlChangeStatus = useCallback(async () => {
        handleCloseModal()
        await fetch(`${Constants.domain}/players/something/?id=${player?.id}&column=status&value=${!isPlayerActive}`, {
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
      }, [player?.id, isPlayerActive])

    const handleSendMessage = useCallback(async (_message, customMessage) => {
        await fetch(`${Constants.domain}/messages/send_personal_message/?id=${player?.id}&message=${customMessage ? _message : message}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                toast.success('Сообщение игроку отправлено', Constants.toastParams)
                forceUpdate()
            })
            .catch(error => console.error(error))
        setMessage('')
      }, [player?.id, message])

    const handleChangeMessage = (e) => {
        setMessage(e.target.value)
    }

    const handleClickPhotovalidation = useCallback(async () => {
        await fetch(`${Constants.domain}/players/something/?id=${player?.id}&column=paint_checked&value=${paintChecked ? 0 : 1}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                toast.success('Значение фотовалидия изменено', Constants.toastParams)
                handleSendMessage(paintChecked ? 'Фотовалидация вашего ростера отклонена' : 'Вы успешно прошли фотовалидацию ростера', true)
                setPaintChecked(!paintChecked)
                forceUpdate()
            })
            .catch(error => {
                console.error(error)
                toast.error('Возникла ошибка', Constants.toastParams)
            })
      }, [player, handleSendMessage, paintChecked])

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
            label='Cообщение игроку (от бота)'
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
        const oppId = get(playerInfo, `game_${playIndex}_opp`)
        const opponent = find(players.data, ['id', oppId])
        const tp = get(playerInfo, `game_${playIndex}_tp`)
        const gameResult = tp > 10 ? 'Win' : tp === 10 ? 'Draw' : tp === null ? '' : 'Lose'
        return opponent
            ? <button key={index} id={Styles.playContainer} onClick={handleClickPlayer(opponent)}>
                {renderPlayRow(playIndex, `${opponent.surname} ${opponent.name}`, gameResult, tp, index % 2)}
            </button>
            : null
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
        {playerInfo.game_1_opp
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
                    <Checkbox onClick={noop} checked={rosterViewType.easy} />
                </div>
                {rosterViewType.easy
                    ? <RosterEasy roster={roster} info={rosterInfo} />
                    : <Roster roster={roster} info={rosterInfo} />
                }
                <button id={Styles.rulesButton} onClick={handleClickAllegiance}>Правила Армии</button>
            </>
            : null
        }
        {size(photos) && _player.isJudge
            ? <PhotoGallery photos={photos} />
            : null
        }
        {_player.isJudge
            ? <> 
                <button id={Styles.rulesButton} onClick={handleClickPhotovalidation}>{paintChecked ? 'Отменить фотовалидацию' : 'Принять фотовалидацию'}</button>
                <button id={Styles.rulesButton} onClick={handleOpenStatusModal}>Изменить статус игрока на {isPlayerActive ? '"Не активен"' : '"Активен"'}</button>
                <button id={Styles.rulesButton} onClick={handleOpenDropModal}>Удалить игрока с турнира</button>
                {renderSendMessage()}
            </>
            : null
        }
        <Modal {...modalData} onClose={handleCloseModal} />
        <ToastContainer />
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