import React, {useState, useEffect, useCallback, useReducer} from 'react'
import Autocomplete from '@mui/joy/Autocomplete'
import {player} from '../utilities/appState'
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
    'Москва',
    'Екатеринбург',
    'Новосибирск',
    'Санкт-Петербург',
    'Нижний Тагил',
    'Казань',
    'Нижний Новгород',
    'Краснодар',
    'Соликамск',
    'Сургут',
    'Тула',
    'Тюмень',
    'Ханты-Мансийск',
    'Чебоксары',
    'Минск',
    'Миасс',
    'Омск',
    'Улан-Удэ',
    'Томск',
    'Барнаул'
]

const Registration = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const user = tg.initDataUnsafe?.user
    const [isButtonPress, setIsButtonPress] = useState(false)
    const [name, setName] = useState(user?.first_name || '')
    const [surname, setSurname] = useState(user?.last_name || '')
    const [city, setCity] = useState('')
    const [userAlreadyReg, setUserAlreadyReg] = useState(true)

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
        fetch(`https://aoscom.online/players/player/?tg_id=${user?.id}`)
            .then(response => response.json())
            .then(data => {
                if (data.tgId) {
                    setUserAlreadyReg(true)
                    player.roster = data.roster
                    player.allegianceId = JSON.parse(data.roster_stat)?.allegianceId
                    player.allegiance = JSON.parse(data.roster_stat)?.allegiance
                    forceUpdate()
                } else {
                    setUserAlreadyReg(false)
                }
            })
            .catch(error => console.error(error))
    }, [user?.id])

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
        <HeaderImage src={UGT} alt='Core Documents' />
        {isButtonPress || userAlreadyReg
            ? <div id='column' className='Chapter'>
                {player.roster
                    ? <Row title='Ваш ростер' navigateTo='roster' />
                    : null
                }
                <Row title={player.roster ? 'Поменять ростер' : 'Подать ростер'} navigateTo='chooseGrandAlliance' />
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
                    >Зарегистрироваться</button>
                </div>
            </div>
        }
    </>
}

export default Registration