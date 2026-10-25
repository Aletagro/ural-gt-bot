import React, {useEffect, useReducer, useState, useCallback, useMemo} from 'react'
import Autocomplete from '@mui/joy/Autocomplete'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CircularProgress from '@mui/joy/CircularProgress'
import Constants from '../Constants'
import {player, players, fetching, meta} from '../utilities/appState'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Modal from '../components/Modal'
import Image from '../images/IceHammer.png'

import size from 'lodash/size'
import includes from 'lodash/includes'
import findIndex from 'lodash/findIndex'

import Styles from './styles/Registration.module.css'

const tg = window.Telegram?.WebApp
const href = window.location?.href
const urlParams = new URLSearchParams(href.split('?')[1])
player.tgId = tg?.initDataUnsafe?.user?.id
player.vkId = urlParams.get('vk_user_id')
// player.tgId = 530569849
// player.vkId = 45749262

const user = tg?.initDataUnsafe?.user

const inputStyle = {
    '--Input-minHeight': '48px',
    'borderRadius': '4px',
    'margin': '16px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}

const cities = [
    'Екатеринбург',
    'Москва',
    'Новосибирск',
    'Нижний Новгород',
    'Казань',
    'Санкт-Петербург',
    'Краснодар',
    'Тюмень',
    'Ханты-Мансийск',
    'Томск',
    'Новочеркасск',
    'Улан-Удэ',
    'Ижевск',
    'Новый Уренгой',
    'Кемерово',
    'Омск',
    'Барнаул',
    'Челябинск',
    'Пермь',
    'Соликамск',
    'Сургут',
    'Кемерево',
    'Нижний Тагил',
    'Самара',
    'Тула',
    'Воронеж',
    'Чебоксары'
]

const Registration = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [name, setName] = useState(user?.first_name || '')
    const [surname, setSurname] = useState(user?.last_name || '')
    const [city, setCity] = useState('')
    const [modalData, setModalData] = useState({visible: false, title: ''})
    const isPlayerInWaitingList = useMemo(() => {
        const playersPositionInData = tg
            ? findIndex(players.data, ['tgId', player.tgId])
            : findIndex(players.data, ['vkId', player.vkId]) 
        return player.reg && playersPositionInData + 1 > meta.playersLimit
    // eslint-disable-next-line
    }, [player.reg, players.data, meta.playersLimit])

    const isDisableButton = !name || !surname || !city
    if (includes(Constants.judgesIds, player.tgId)) {
        player.isJudge = true
    }

    const handleGetPlayers = useCallback(async () => {
        await fetch(`${Constants.domain}/players/`)
            .then(response => response.json())
            .then(data => {
                players.data = data
                forceUpdate()
            })
            .catch(error => console.error(error))
      }, [])

    const handleRegUser = useCallback(async () => {
        await fetch(`${Constants.domain}/players/reg`, {
            method: 'POST',
            body: JSON.stringify({tgId: player.tgId, vkId: player.vkId, name, surname, city}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                handleGetPlayers()
            })
            .catch(error => console.error(error))
      }, [name, surname, city, handleGetPlayers])

    const handleSendMessage = useCallback(async () => {
        const message = `${player.info?.surname} ${player.info?.name} отказался от участия в турнире`
        // TODO убрать на бек
        await fetch(`${Constants.domain}/messages/send_personal_message/?id=${2}&message=${message}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .catch(error => console.error(error))
      }, [])

    const handleDrop = useCallback(async () => {
        handleCloseModal()
        await fetch(`${Constants.domain}/players/?id=${player?.info?.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                player.isDrop = true
                player.reg = false
                forceUpdate()
                handleSendMessage()
            })
            .catch(error => console.error(error))
      }, [handleSendMessage])

    const getPlayerInfo = useCallback(async () => {
        const urlQuery = player.tgId ? `tgId=${player.tgId}` : `vkId=${player.vkId}`
        const response = await fetch(`${Constants.domain}/players/player/?${urlQuery}`)
        if (response.ok) {
            const data = await response.json()
            if (data.tgId || data.vkId) {
                player.reg = true
                player.roster = data.roster
                player.roster_stat = data.roster_stat
                player.allegianceId = JSON.parse(data.roster_stat)?.allegianceId
                player.allegiance = JSON.parse(data.roster_stat)?.allegiance
                player.info = data
            } else {
                player.reg = false
            }
            fetching.main = false
            // запрос ростеров юзера из основного приложения
            const responseRosters = await fetch(`${Constants.domain}/rosters_db/rosters_by_user?${urlQuery}`)
            if (responseRosters.ok) {
                const rostersData = await responseRosters.json()
                player.mainRosters = rostersData.rosters
            }
            forceUpdate()
        }
        fetching.main = false
    }, [])

    useEffect(() => {
        if (!player.isRequested) {
            player.isRequested = true
            getPlayerInfo()
        }
    }, [getPlayerInfo])

    useEffect(() => {
        if (!size(players.data)) {
            handleGetPlayers()
        }
    }, [handleGetPlayers])

    const handleGetMeta = useCallback(() => {
        fetch(`${Constants.domain}/tournament-meta/`)
            .then(response => response.json())
            .then(data => {
                meta.round = data.round
                meta.isRoundActive = data.isRoundActive
                meta.rostersBeingAccepted = data.rostersBeingAccepted
                meta.isRostersShow = data.isRostersShow
                meta.isTournamentRulesShow = data.isTournamentRulesShow
                meta.isPlayersListShow = data.isPlayersListShow
                meta.isChallengesOpen = data.isChallengesOpen
                meta.isRegOpen = data.isRegOpen
                meta.battleplan = data.battleplan
                meta.playersLimit = data.playersLimit
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

    useEffect(() => {
        handleGetMeta()
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                handleGetMeta()
                handleGetPlayers()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [handleGetMeta, handleGetPlayers])

    const handleCloseModal = () => {
        setModalData({visible: false, title: ''})
    }

    const handleOpenDropModal = () => {
        setModalData({visible: true, title: 'Вы уверен, что хотите отказаться от участия на турнире?', Content: renderModalConent})
    }

    const handleChangeName = (e) => {
        setName(e.target.value)
    }

    const handleChangeSurname = (e) => {
        setSurname(e.target.value)
    }

    const handleChangeCity = (e, value) => {
        setCity(value || e.target.value)
    }

    const handleClickButton = () => {
        handleRegUser()
        player.reg = true
        forceUpdate()
    }

    const handleJudgeCall = () => {
        fetch(`${Constants.domain}/messages/judges_call?id=${player?.info?.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => response.json())
            .catch(error => console.error(error))
        toast.success('Судья спешит на помощь!', Constants.toastParams)
    }

    const handleRetry = () => {
        player.isDrop = false
        forceUpdate()
    }

    const handleClickGuest = () => {
        player.isGuest = true
        forceUpdate()
    }

    const renderModalConent = () => <div id={Styles.modal}>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет</button>
        <button id={Styles.modalButton} onClick={handleDrop}>Да</button>
    </div>

    const renderRegForm = () => <div>
        <h2 id={Styles.title}>Регистрация на Ice Hammer 2026</h2>
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeName}
            label='Ваше имя'
            value={name}
        />
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeSurname}
            label='Ваша фамилия'
            value={surname}
        />
        <Autocomplete
            placeholder='Город'
            onInputChange={handleChangeCity}
            options={cities.sort()}
            sx={inputStyle}
            value={city}
            autoComplete={true}
            autoSelect={true}
            freeSolo={true}
        />
        <div id={Styles.buttonContainer}>
            <button
                id={isDisableButton ? Styles.disableRegButton : Styles.regButton}
                onClick={handleClickButton}
                disabled={isDisableButton}
            >
                Зарегистрироваться
            </button>
        </div>
        <div id={Styles.buttonContainer}>
            <button id={Styles.regButton} onClick={handleClickGuest}>
                Войти как гость
            </button>
        </div>
    </div>

    const renderNotice = (title, type) => <div id={type === 'error'
        ? Styles.errorNotice
        : type === 'warning'
            ? Styles.warningNotice
            : Styles.notice
        }>
        <h3 id={type === 'warning' ? Styles.title : Styles.noticeText}>{title}</h3>
    </div>

    if (player.isDrop) {
        return <>
            <HeaderImage src={Image} alt='Core Documents' />
            <h2 id={Styles.title}>Вы были удалены из списка участников турнира</h2>
            <h2 id={Styles.title}>Вы сможете в любой момент подать регистрацию снова</h2>
            <button id={Styles.regButton} onClick={handleRetry}>Зарегистрироваться</button>
        </>
    }

    return <>
        <HeaderImage src={Image} alt='Core Documents' />
        {fetching.main && meta.isRegOpen
            ? <div id={Styles.loaderContainer}>
                <CircularProgress variant="soft"/>
            </div>
            : player.reg || player.isJudge || !meta.isRegOpen || player.isGuest
                ? <div id='column' className='Chapter'>
                    {isPlayerInWaitingList ? renderNotice('Вы находитесь в листе ожидания, организаторы свяжутся с вами', 'warning') : null}
                    {player.isJudge
                        ? renderNotice('Вы организатор этого турнира')
                        : player.reg
                            ? renderNotice('Вы зарегистированы на Ice Hammer 2026')
                            : renderNotice('Вы еще не зарегистированы, попробуйте еще раз или обратитесь к организаторам', 'error')
                    }
                    {player.isJudge ? <Row title='Кабинет Организатора' navigateTo='admin' /> : null}
                    {(player.reg && meta.isRoundActive) ? <Row title='Ваша Игра' navigateTo='play' /> : null}
                    {player.reg && player.roster
                        ? <Row title='Ваш ростер' navigateTo='roster' state={{isInfo: true}} />
                        : null
                    }
                    {meta.rostersBeingAccepted && player.reg && !isPlayerInWaitingList
                        ? <Row title={player.roster ? 'Поменять ростер' : 'Подать ростер'} navigateTo='chooseGrandAlliance' />
                        : null
                    }
                    {meta.isRostersShow || player.isJudge ? <Row title='Ростера' navigateTo='rosters' /> : null}
                    {meta.round ? <Row title='Раунды' navigateTo='rounds' state={{title: 'Ice Hammer 2026', round: meta.round}} /> : null}
                    {player.isJudge || meta.isPlayersListShow ? <Row title={meta.round ? 'Турнирная Таблица' : 'Список участников'} navigateTo='players' /> : null}
                    {player.isJudge || meta.round ? <Row title='Лидеры турнира' navigateTo='leaders' /> : null}
                    {player.reg && meta.round === 5 && !player?.info?.sport_voted
                        ? <Row title='Голосование За Спортивность' navigateTo='vote' />
                        : null
                    }
                    {player.reg && ((meta.round === 4 && !meta.isRoundActive) || meta.round === 5) && !player?.info?.paint_voted
                        ? <Row title='Голосование За Покрас' navigateTo='paintVote' />
                        :null
                    }
                    {player.isJudge || (meta.rostersBeingAccepted && player.reg) ? <Row title='Фотовалидация Армии' navigateTo='photovalidation' /> : null}
                    {player.isJudge || meta.isChallengesOpen ? <Row title='Челленджи' navigateTo='challenges' /> : null}
                    {player.reg ? <Row title='Подать заявку в конкурс Покраса' navigateTo='paintVoteReg' /> : null}
                    <Row title='Правила' navigateTo='mainRules' />
                    <Row title='Калькулятор Урона' navigateTo='calculator' />
                    {player.isJudge || meta.isTournamentRulesShow ? <Row title='Регламент Ice Hammer 2026' navigateTo='tournamentRules' /> : null}
                    <Row title='Подсказка во время игры' navigateTo='help' />
                    {/* {player.info?.id && (!player.info?.tgId || !player.info?.vkId) ? <Row title='Связать аккаунты Телеграмма и ВК' navigateTo='linkAccounts' /> : null} */}
                    {meta.isRoundActive && player.reg ? <button id={Styles.button} onClick={handleJudgeCall}>Вызвать Судью</button> : null}
                    {meta.round || !player.reg ? null : <button id={Styles.button} onClick={handleOpenDropModal}>Отказаться от участия на турнире</button>}
                    <ToastContainer />
                </div>
                : renderRegForm()
        }
        <Modal {...modalData} onClose={handleCloseModal} />
    </>
}

export default Registration
