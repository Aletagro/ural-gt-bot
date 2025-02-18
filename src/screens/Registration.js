import React, {useState, useEffect, useCallback, useReducer} from 'react'
import Autocomplete from '@mui/joy/Autocomplete'
import CircularProgress from '@mui/joy/CircularProgress'
import Constants from '../Constants'
import {player, players, fetching} from '../utilities/appState'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import UGT from '../images/UGT.png'

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
    'Казань',
    'Миасс',
    'Москва',
    'Нижний Новгород',
    'Нижний Тагил',
    'Новосибирск',
    'Омск',
    'Санкт-Петербург',
    'Соликамск',
    'Сургут',
    'Томск',
    'Тюмень',
    'Ханты-Мансийск',
    'Челябинск',
    'Ярославль'
]

const Registration = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const user = tg.initDataUnsafe?.user
    const [isButtonPress, setIsButtonPress] = useState(false)
    const [name, setName] = useState(user?.first_name || '')
    const [surname, setSurname] = useState(user?.last_name || '')
    const [city, setCity] = useState('')

    const isDisableButton = !name || !surname || !city

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
            fetch(`https://aoscom.online/players/player/?tg_id=${user?.id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.tgId) {
                        player.reg = true
                        player.roster = data.roster
                        player.allegianceId = JSON.parse(data.roster_stat)?.allegianceId
                        player.allegiance = JSON.parse(data.roster_stat)?.allegiance
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
        setIsButtonPress(true)
        handleRegUser()
    }

    return <>
        <HeaderImage src={UGT} alt='Core Documents' isUral />
        {fetching.main
            ? <div id={Styles.loaderContainer}>
                <CircularProgress variant="soft"/>
            </div>
            : isButtonPress || player.reg || user?.id === Constants.myTgId
                ? <div id='column' className='Chapter'>
                    {/* <Row title='Ваша Игра' navigateTo='Play' /> */}
                    {player.roster
                        ? <Row title='Ваш ростер' navigateTo='roster' />
                        : null
                    }
                    <Row title={player.roster ? 'Поменять ростер' : 'Подать ростер'} navigateTo='chooseGrandAlliance' />
                    {/* <Row title='Ростера' navigateTo='rosters' /> */}
                    {/* <Row title='Раунды' navigateTo='rounds' state={{title: 'Ural GT 2025'}} /> */}
                    <Row title='Список Участников' navigateTo='players' />
                    {/* <Row title='Турнирная Таблица' navigateTo='players' /> */}
                    <Row title='Правила' navigateTo='mainRules' />
                    <Row title='Калькулятор Урона' navigateTo='calculator' />
                    <Row title='Регламент Ural GT 2025' navigateTo='tournamentRules' />
                </div>
                : <div>
                    <h2 id={Styles.title}>Регистрация на Ural GT 2025</h2>
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
        }
    </>
}

export default Registration
