import React, {useEffect, useReducer, useState, useCallback, useMemo} from 'react'
import Autocomplete from '@mui/joy/Autocomplete'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CircularProgress from '@mui/joy/CircularProgress'
import Constants from '../Constants'
import {player, players, fetching, meta} from '../utilities/appState'
import FloatingLabelInput, {fieldSx} from '../components/FloatingLabelInput'
import MainMenu from '../components/MainMenu'
import HeaderImage from '../components/HeaderImage'
import Modal from '../components/Modal'
import {ModalActions, ModalButton} from '../components/ModalActions'
import {fetchMeta} from '../utilities/applyMeta'
import Image from '../images/IceHammer.png'

import size from 'lodash/size'
import map from 'lodash/map'
import includes from 'lodash/includes'
import findIndex from 'lodash/findIndex'

import Styles from './styles/Registration.module.css'
import Button from '../components/Button'

const tg = window.Telegram?.WebApp
const href = window.location?.href
const urlParams = new URLSearchParams(href.split('?')[1])
player.tgId = tg?.initDataUnsafe?.user?.id
player.vkId = urlParams.get('vk_user_id')
// Для локальных тестов: id из .env.development.local (в git не попадает) подставляется только при npm start.
// В боевую сборку (npm run build / deploy) этот блок не попадает, поэтому запушить его по ошибке нельзя
if (process.env.NODE_ENV === 'development') {
    if (process.env.REACT_APP_DEV_TG_ID) player.tgId = Number(process.env.REACT_APP_DEV_TG_ID)
    if (process.env.REACT_APP_DEV_VK_ID) player.vkId = process.env.REACT_APP_DEV_VK_ID
}

const user = tg?.initDataUnsafe?.user

const inputStyle = {
    'margin': '16px',
}

// Выпадающий список городов в нашем стиле
const listboxSx = {
    mt: '4px',
    p: '6px',
    border: '1.5px solid #d8c88a',
    borderRadius: '16px',
    background: '#fffdf8',
    boxShadow: '0 8px 24px rgba(20, 16, 10, 0.18)',
    fontFamily: 'Minion Pro Regular',
    '--ListItem-radius': '10px',
    '& .MuiAutocomplete-option': {
        color: '#1d1810',
        fontSize: '16px',
    },
    '& .MuiAutocomplete-option[aria-selected="true"]': {
        background: '#fbf3dc',
        fontFamily: 'Minion Pro Bold',
    },
    '& .MuiAutocomplete-option:hover, & .MuiAutocomplete-option.Mui-focused': {
        background: '#f3e9c4',
    },
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
    // Судья определяется по Telegram id или по VK id, хватает любого из них
    const isJudgeByTg = includes(Constants.judgesIds, player.tgId)
    const isJudgeByVk = Boolean(player.vkId) && includes(map(Constants.judgesVkIds, String), String(player.vkId))
    if (isJudgeByTg || isJudgeByVk) {
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
        fetchMeta().then(() => forceUpdate())
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

    const renderModalConent = () => <ModalActions>
        <ModalButton onClick={handleCloseModal}>Нет</ModalButton>
        <ModalButton type='danger' onClick={handleDrop}>Да</ModalButton>
    </ModalActions>

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
            sx={[fieldSx, inputStyle]}
            slotProps={{listbox: {sx: listboxSx}}}
            value={city}
            autoComplete={true}
            autoSelect={true}
            freeSolo={true}
        />
        <div id={Styles.buttonContainer}>
            <Button className={Styles.regButton} onClick={handleClickButton} disabled={isDisableButton}>
                Зарегистрироваться
            </Button>
        </div>
        <div id={Styles.buttonContainer}>
            <Button className={Styles.regButton} onClick={handleClickGuest} type='secondary'>
                Войти как гость
            </Button>
        </div>
    </div>

    if (player.isDrop) {
        return <>
            <HeaderImage src={Image} alt='Core Documents' />
            <h2 id={Styles.title}>Вы были удалены из списка участников турнира</h2>
            <h2 id={Styles.title}>Вы сможете в любой момент подать регистрацию снова</h2>
            <Button className={Styles.regButton} onClick={handleRetry}>Зарегистрироваться</Button>
        </>
    }

    const isLoading = fetching.main && meta.isRegOpen
    const showMenu = !isLoading && (player.reg || player.isJudge || !meta.isRegOpen || player.isGuest)

    return <>
        {showMenu
            ? <>
                <MainMenu
                    isPlayerInWaitingList={isPlayerInWaitingList}
                    onCallJudge={handleJudgeCall}
                    onOpenDrop={handleOpenDropModal}
                />
                <ToastContainer />
            </>
            : <>
                <HeaderImage src={Image} alt='Core Documents' />
                {isLoading
                    ? <div id={Styles.loaderContainer}>
                        <CircularProgress variant="soft"/>
                    </div>
                    : renderRegForm()
                }
            </>
        }
        <Modal {...modalData} onClose={handleCloseModal} />
    </>
}

export default Registration
