import React, {useEffect, useReducer, useState, useCallback} from 'react'
import Autocomplete from '@mui/joy/Autocomplete'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CircularProgress from '@mui/joy/CircularProgress'
import Constants from '../Constants'
import {player, players, fetching, meta} from '../utilities/appState'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import Image from '../images/Strelka.png'

import size from 'lodash/size'
import includes from 'lodash/includes'

import Styles from './styles/Registration.module.css'

const tg = window.Telegram.WebApp

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
    'Москва',
    'Санкт-Петербург',
    'Чебоксары',
    'Самара',
    'Тверь',
    'Тула',
    'Краснодар'
]

const PLAYERS_LIMIT = 24

const Registration = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const user = tg.initDataUnsafe?.user
    const [name, setName] = useState(user?.first_name || '')
    const [surname, setSurname] = useState(user?.last_name || '')
    const [city, setCity] = useState('')

    const isDisableButton = !name || !surname || !city
    if (includes(Constants.judgesIds, user?.id)) {
        player.isJudge = true
    }

    const handleRegUser = useCallback(async () => {
        await fetch('https://aoscom.online/players/reg', {
            method: 'POST',
            body: JSON.stringify({tgId: user?.id, name, surname, city}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => response.json())
            .catch(error => console.error(error))
      }, [name, surname, city, user?.id])

    useEffect(() => {
        if (!player.isRequested) {
            player.isRequested = true
            // fetch(`https://aoscom.online/players/player/?tg_id=${208050275}`)
            fetch(`https://aoscom.online/players/player/?tg_id=${user?.id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.tgId) {
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
                    forceUpdate()
                })
                .catch(error => console.error(error))
        }
    }, [user?.id])

    useEffect(() => {
        if (!players.data.length) {
            fetch('https://aoscom.online/players/')
                .then(response => response.json())
                .then(data => {
                    players.data = data
                })
                .catch(error => console.error(error))
        }
    }, [])

    useEffect(() => {
        fetch('https://aoscom.online/tournament-meta/')
            .then(response => response.json())
            .then(data => {
                meta.round = data.round
                meta.isRoundActive = data.isRoundActive
                meta.rostersBeingAccepted = data.rostersBeingAccepted
                meta.isRostersShow = data.isRostersShow
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

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
        fetch(`https://aoscom.online/messages/judges_call?tg_id=${user?.id}`)
            .then(response => response.json())
            .catch(error => console.error(error))
        toast.success('Судья спешит на помощь!', Constants.toastParams)
    }

    const renderRegForm = () => <div>
        <h2 id={Styles.title}>Регистрация на Стрелка 2025</h2>
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
    </div>

    const renderPlayersLimitStub = () => <div>
        <h2 id={Styles.title}>К сожалению, все места на турнире уже заняты</h2>
        <h2 id={Styles.title}>Пожалуйста, напишите организаторам, чтобы они добавили вас в лист ожидания</h2>
    </div>

    return <>
        <HeaderImage src={Image} alt='Core Documents' isUral />
        {fetching.main
            ? <div id={Styles.loaderContainer}>
                <CircularProgress variant="soft"/>
            </div>
            : player.reg || player.isJudge
                ? <div id='column' className='Chapter'>
                    {user?.id === Constants.myTgId || player.isJudge ? <Row title='Кабинет Организатора' navigateTo='admin' /> : null}
                    {/* <Row title='Кабинет Организатора' navigateTo='admin' /> */}
                    {player.reg && meta.isRoundActive ? <Row title='Ваша Игра' navigateTo='Play' /> : null}
                    {player.reg && player.roster
                        ? <Row title='Ваш ростер' navigateTo='roster' state={{isInfo: true}} />
                        : null
                    }
                    {meta.rostersBeingAccepted
                        ? <Row title={player.roster ? 'Поменять ростер' : 'Подать ростер'} navigateTo='chooseGrandAlliance' />
                        : null
                    }
                    {meta.isRostersShow ? <Row title='Ростера' navigateTo='rosters' /> : null}
                    {meta.round ? <Row title='Раунды' navigateTo='rounds' state={{title: 'Strelka 2025', round: meta.round}} /> : null}
                    <Row title={meta.round ? 'Турнирная Таблица' : 'Список участников'} navigateTo='players' />
                    {player.reg && meta.round === 5 && !player.sport_voted
                        ? <Row title='Голосование За Спортивность' navigateTo='vote' state={{type: 'sport'}} />
                        : null
                    }
                    {player.reg && ((meta.round === 4 && !meta.isRoundActive) || meta.round === 5) && !player.paint_voted
                        ? <Row title='Голосование За Покрас' navigateTo='vote' state={{type: 'paint'}} />
                        :null
                    }
                    <Row title='Правила' navigateTo='mainRules' />
                    <Row title='Калькулятор Урона' navigateTo='calculator' />
                    <Row title='Регламент Стрелка 2025' navigateTo='tournamentRules' />
                    <Row title='Подсказка во время игры' navigateTo='help' />
                    {meta.isRoundActive ? <button id={Styles.button} onClick={handleJudgeCall}>Вызвать Судью</button> : null}
                    <ToastContainer />
                </div>
                : size(players.data) >= PLAYERS_LIMIT
                    ? renderPlayersLimitStub()
                    : renderRegForm()
        }
    </>
}

export default Registration
