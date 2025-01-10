import React, {useState} from 'react'
import Autocomplete from '@mui/joy/Autocomplete'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import FloatingLabelInput from '../components/FloatingLabelInput'

import Styles from './styles/Registration.module.css'

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

const toastParams = {
    position: 'bottom-center',
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    draggable: true,
    theme: 'colored',
    pauseOnHove: false
}

const Registration = () => {
    const user = tg.initDataUnsafe?.user

    const [name, setName] = useState(user?.first_name || '')
    const [surname, setSurname] = useState(user?.last_name || '')
    const [city, setCity] = useState('')

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
        toast.success(`Name: ${name}, Surname: ${surname}, City: ${city}, ID: ${user?.id}`, {
            position: 'bottom-center',
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            draggable: true,
            theme: 'colored',
            pauseOnHove: false
        })
    }

    return <div>
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
            <button id={Styles.button} onClick={handleClickButton}>Зарегистрироваться</button>
        </div>
        <ToastContainer />
    </div>
}

export default Registration