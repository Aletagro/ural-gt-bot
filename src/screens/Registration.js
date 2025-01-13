import React, {useState, useEffect, useCallback} from 'react'
import Autocomplete from '@mui/joy/Autocomplete'
import FloatingLabelInput from '../components/FloatingLabelInput'

import Styles from './styles/Registration.module.css'

// Добавить в package при тестирование
// "proxy": "http://78.155.197.84"

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
    const user = tg.initDataUnsafe?.user
    const [isButtonPress, setIsButtonPress] = useState(false)
    const [name, setName] = useState(user?.first_name || '')
    const [surname, setSurname] = useState(user?.last_name || '')
    const [city, setCity] = useState('')
    const [userAlreadyReg, setUserAlreadyReg] = useState(false)
    const [userId, setUserId] = useState(null)
    const [data, setData] = useState(null)

    const isDisableButton = !name || !surname || !city

    const handleRegUser = useCallback(async () => {
        await fetch('https://78.155.197.84/players/reg', {
            method: 'POST',
            body: JSON.stringify({tgId: 35, name, surname, city}),
            // body: JSON.stringify({tgId: user?.id, name, surname, city}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => response.json())
            .then(json => {
                setUserId(json?.player_info?.id)
            })
            .catch(error => console.error(error))
      }, [name, surname, city])

    useEffect(() => {
        fetch(`https://78.155.197.84/players/player/?q=${user?.id}`)
            .then(response => response.json())
            .then(json => {
                if (json.tgId) {
                    setUserAlreadyReg(true)
                }
            })
            .catch(error => console.error(error))
    }, [user?.id])

    useEffect(() => {
        fetch('https://78.155.197.84/players/')
            .then(response => response.json())
            .then(json => setData(json[24]))
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

    return isButtonPress
        ? userId > 60
            ? <div id={Styles.container}>
                <h2 id={Styles.title}>К сожалению, всем места на турнире уже заняты. Вы добавлены в лист ожидания Ural GT 2025</h2>
                <h3 id={Styles.title}>Если места освободятся, то мы сразу с вами свяжемся</h3>
            </div>
            : <div id={Styles.container}>
                <h2 id={Styles.title}>Вы успешно зарегистрированы на Ural GT 2025</h2>
                <h3 id={Styles.title}>Ждём вас 1 марта в Екатеринбурге</h3>
            </div>
        : userAlreadyReg
            ? <div id={Styles.container}>
                <h2 id={Styles.title}>Вы уже зарегистрированы на Ural GT 2025</h2>
                <h3 id={Styles.title}>Ждём вас 1 марта в Екатеринбурге</h3>
            </div>
            : <div>
                <h2 id={Styles.title}>Регистрация на Ural GT 2025</h2>
                <h2 id={Styles.title}>Имя {data?.name}</h2>
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
                        id={isDisableButton ? Styles.disableButton : Styles.button}
                        onClick={handleClickButton}
                        disabled={isDisableButton}
                    >Зарегистрироваться</button>
                </div>
            </div>
}

export default Registration