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
    'border-color': '#B4B4B4',
    'box-shadow': 'none',
    'font-family': 'Minion Pro Regular'
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

    const isDisableButton = !name || !surname || !city

    const [data, setData] = useState(null);

    const handleGetData = useCallback(async () => {
        // const result = await fetch('https://openlibrary.org/search/authors.json?q=j%20k%20rowling')
        const result = await fetch('http://78.155.197.84/players/', {
        // const result = await fetch('/players/', {
            headers: {
                'Access-Control-Allow-Method': 'GET, OPTIONS',
                'Access-Control-Allow-Origin': '*'
            }
        })
            .then(response => response.json())
            .then(json => setData(json))
            .catch(error => console.error(error))
        console.log(result)
      }, [])
    console.log('data', data)

    useEffect(() => {
        handleGetData()
    }, [handleGetData])

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
    }

    return isButtonPress
        ? <div>
            <h2 id={Styles.title}>Вы успешно зарегистрированы на Ural GT 2025</h2>
            <h3 id={Styles.title}>Ждём вас 1 марта в Екатеринбурге</h3>
        </div>
        : <div>
            <h2 id={Styles.title}>Регистрация на Ural GT 2025</h2>
            <h2 id={Styles.title}>{data && data[0]?.name}</h2>
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