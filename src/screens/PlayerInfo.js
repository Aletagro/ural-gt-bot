import React, {useReducer, useState, useCallback, useMemo, useEffect} from 'react'
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
import PlayerHero from '../components/PlayerHero'
import PlayerResults from '../components/PlayerResults'
import PlayerBadges from '../components/PlayerBadges'
import PlayerGames from '../components/PlayerGames'
import PlayerShareCard from '../components/PlayerShareCard'
import {players, player as _player, rosterViewType, meta} from '../utilities/appState'
import {useFreshPlayers} from '../utilities/useFreshPlayers'
import {usePlayerShare} from '../utilities/usePlayerShare'
import {ROUNDS_COUNT} from '../utilities/gamesCalc'
import {addDomainForUrl} from '../utilities/utils'
import {buildTournamentContext, calcPlayerCard} from '../utilities/playerCalc'

import map from 'lodash/map'
import find from 'lodash/find'
import noop from 'lodash/noop'
import size from 'lodash/size'

import Styles from './styles/PlayerInfo.module.css'
import CardStyles from '../components/styles/PlayerCard.module.css'

const TABS = [
    {key: 'overview', title: 'Обзор'},
    {key: 'roster', title: 'Ростер'},
]
const JUDGE_TAB = {key: 'judge', title: 'Судье'}

const safeParse = (value) => {
    if (!value) return null
    if (typeof value === 'object') return value
    try {
        return JSON.parse(value)
    } catch (e) {
        return null
    }
}

const PlayerInfo = ({setShareAction}) => {
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const {player} = useLocation().state
    const isJudge = Boolean(_player.isJudge)

    // свежие данные, пока грузятся или не получилось загрузить, берём сохранённые
    const {data: freshData} = useFreshPlayers()
    const data = useMemo(() => freshData?.length ? freshData : (players?.data || []), [freshData])
    const standing = players?.standing
    const isFinished = Boolean(meta?.isFinished)

    const playerInfo = find(data, ['id', player.id]) || find(players?.data, ['id', player.id]) || player
    const rosterInfo = safeParse(player.roster_stat || playerInfo.roster_stat) || {}
    const roster = safeParse(player.roster || playerInfo.roster)

    const [tab, setTab] = useState('overview')
    const [modalData, setModalData] = useState({visible: false, title: ''})
    const [isPlayerDrop, setIsPlayerDrop] = useState(false)
    const [isPlayerActive, setIsPlayerActive] = useState(Boolean(playerInfo?.status))
    const [message, setMessage] = useState('')
    const [paintChecked, setPaintChecked] = useState(player.paint_checked)
    const photos = useMemo(() => map(playerInfo?.validation_photo_path, addDomainForUrl), [playerInfo?.validation_photo_path])

    const context = useMemo(
        () => buildTournamentContext(data, standing || [], ROUNDS_COUNT, isFinished),
        [data, standing, isFinished]
    )
    const card = useMemo(() => calcPlayerCard(context, player.id, ROUNDS_COUNT), [context, player.id])
    const handleUnsupported = useCallback(() => toast.error('На этом устройстве нельзя поделиться картинкой', Constants.toastParams), [])
    const {shareRef, share} = usePlayerShare(card, isFinished, handleUnsupported)

    useEffect(() => {
        if (!setShareAction || !card) return undefined
        setShareAction(() => share)
        return () => setShareAction(null)
    }, [setShareAction, share, card])

    const handleClickAllegiance = () => {
        navigate('/army', {state: {title: rosterInfo.allegiance, allegianceId: roster.allegianceId}})
    }

    const handleClickPlayer = (opponent) => () => {
        navigate('/playerInfo', {state: {player: opponent, title: `${opponent.surname} ${opponent.name}`}})
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
        // encodeURIComponent: иначе сообщение с & или # обрежется
        await fetch(`${Constants.domain}/messages/send_personal_message/?id=${player?.id}&message=${encodeURIComponent(customMessage ? _message : message)}`, {
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

    const renderTabs = () => {
        const tabs = isJudge ? [...TABS, JUDGE_TAB] : TABS
        return <div className={CardStyles.tabs}>
            {map(tabs, (item) =>
                <button
                    key={item.key}
                    className={`${CardStyles.tab} ${tab === item.key ? CardStyles.tabActive : ''}`}
                    onClick={() => setTab(item.key)}
                >
                    {item.title}
                </button>
            )}
        </div>
    }

    // Вкладка «Обзор»
    const renderOverview = () => card
        ? <>
            <PlayerHero card={card} isFinished={isFinished} />
            <PlayerResults card={card} />
            <PlayerBadges badges={card.badges} />
            <PlayerGames rounds={card.rounds} onOpenPlayer={handleClickPlayer} />
        </>
        : <>
            <p id={Styles.title}><b>Город:</b> {player.city}</p>
            <p id={Styles.title}><b>Гранд Альянс:</b> {rosterInfo?.grandAlliance}</p>
            <p id={Styles.title}><b>Армия:</b> {rosterInfo?.allegiance}</p>
        </>

    // Вкладка «Ростер»
    const renderRoster = () => roster
        ? <>
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
        : <p className={CardStyles.rosterMissing}>Ростер не сдан</p>

    // Вкладка «Судье»
    const renderJudge = () => <div className={CardStyles.judgeBlock}>
        <p className={CardStyles.judgeStatus}>Статус игрока: <b>{isPlayerActive ? 'Активен' : 'Не активен'}</b></p>
        {size(photos)
            ? <PhotoGallery photos={photos} />
            : null
        }
        <button id={Styles.rulesButton} onClick={handleClickPhotovalidation}>{paintChecked ? 'Отменить фотовалидацию' : 'Принять фотовалидацию'}</button>
        <button id={Styles.rulesButton} onClick={handleOpenStatusModal}>Изменить статус игрока на {isPlayerActive ? '"Не активен"' : '"Активен"'}</button>
        <button id={Styles.rulesButton} onClick={handleOpenDropModal}>Удалить игрока с турнира</button>
        {renderSendMessage()}
    </div>

    return <div id='column' className='Chapter'>
        {isPlayerDrop ? <p id={Styles.isPlayerDrop}>Игрок удалён с турнира</p> : null}
        {renderTabs()}
        {tab === 'roster' ? renderRoster() : null}
        {tab === 'judge' && isJudge ? renderJudge() : null}
        {tab === 'overview' ? renderOverview() : null}
        {card ? <PlayerShareCard ref={shareRef} card={card} isFinished={isFinished} /> : null}
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