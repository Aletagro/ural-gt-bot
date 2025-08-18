import React from 'react'
import {player} from '../utilities/appState'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'

import Styles from './styles/TournamentRules.module.css'

const Photovalidation = () => {
    const handleCopyLink = () => {
        navigator.clipboard.writeText(player?.info?.google_folder_url)
        toast.success('Ссылка скопирована', Constants.toastParams)
    }

    return <div id='column' className='Chapter'>
        <p id={Styles.text}>Пожалуйста, очень внимательно прочитайте этот текст</p>
        <p id={Styles.text}>Обязательная фотовалидация листов через загрузку фото в папку на гугл диске. Ссылку на вашу папку вы можете получить, нажав на кнопку ниже. Просим вам не использовать очень большие файлы и загружать не больше 5 фотографи После того, как судьи проверят ваши фото, вам придёт сообщение от бота</p>
        <p id={Styles.text}>Крайний срок подачи фото армии 23:59 8 сентября.</p>
        {player?.info?.google_folder_url ? <p id={Styles.link} onClick={handleCopyLink}>Ваша ссылка: {player?.info?.google_folder_url}</p> : null}
        <button id={Styles.button} onClick={handleCopyLink}>Скопировать ссылку</button>
        <ToastContainer />
    </div>
}

export default Photovalidation