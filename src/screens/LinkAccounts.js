import React, {useCallback, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Constants from '../Constants'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {player} from '../utilities/appState'
import FloatingLabelInput from '../components/FloatingLabelInput'

import Styles from './styles/LinkAccounts.module.css'
import Button from '../components/Button'

const LinkAccounts = () => {
    const navigate = useNavigate()
    const [code, setCode] = useState('')

    const handleGetCode = useCallback(async () => {
        await fetch(`${Constants.domain}/players/generate_link_code?id=${player.info.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
        toast.success('Код отправлен', Constants.toastParams)
    }, [])

    const handleChangeCode = useCallback((e) => {
        setCode(e.target.value)
    }, [])

    const handleSetCode = useCallback(async (e) => {
        const urlQuery = player.tgId ? `tgId=${player.tgId}` : `vkId=${player.vkId}`
        const response = await fetch(`${Constants.domain}/players/link_accounts?code=${code}&${urlQuery}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
        if (response.ok) {
            toast.success('Аккаунты успешно связаны', Constants.toastParams)
            const responsePlayer = await fetch(`${Constants.domain}/players/player/?${urlQuery}`)
            if (responsePlayer.ok) {
                const data =  await responsePlayer.json()
                player.reg = true
                player.roster = data.roster
                player.roster_stat = data.roster_stat
                player.allegianceId = JSON.parse(data.roster_stat)?.allegianceId
                player.allegiance = JSON.parse(data.roster_stat)?.allegiance
                player.info = data
            }
            navigate('/')
        } else {
            toast.error('Введён не верный код', Constants.toastParams)
        }
    }, [code, navigate])

    return <div id='column' className='Chapter'>
        {!player.info.link_code
            ? <>
                <p id={Styles.text}>Введите полученный код</p>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeCode}
                    label='Введите код'
                    value={code}
                />
                <Button className={Styles.button} onClick={handleSetCode}>Отправить код</Button>
            </>
            : <>
                <p id={Styles.text}>Чтобы связать аккаунты Телеграма и ВК, нажмите на кнопку "Получить код"</p>
                <p id={Styles.text}>В боте вам придёт короткий код. Откройте приложение в той соц сети, где вы еще не зарегистрированы. Нажмите кнопку, "Войти как гость" и на таком же экранее, введите код</p>
                <Button className={Styles.button} onClick={handleGetCode}>Получить код</Button>
            </>

        }
        <ToastContainer />
    </div>
}

export default LinkAccounts

const inputStyle = {
    'width': '100%',
    'marginBottom': '16px',
}