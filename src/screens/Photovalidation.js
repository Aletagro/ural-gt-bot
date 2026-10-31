import React, {useCallback} from 'react'
import {player} from '../utilities/appState'
import PhotoUploader from '../components/PhotoUploader'
import Constants from '../Constants'

import InfoNote from '../components/InfoNote'

const Photovalidation = () => {
    const handleDeletePhoto = useCallback(async (photoId) => {
        const response = await fetch(`${Constants.domain}/players/validation_photo?player_id=${player?.info?.id}&photo_id=${photoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
        if (response.ok) {
            const data = await response.json()
            player.info.validation_photo_path = data.paths
        }
    }, [])

    const handleUploadSuccess = useCallback((urls) => {
        player.info.validation_photo_path = urls
    }, [])

    return <div id='column' className='Chapter'>
        <PhotoUploader
            photoUrls={player?.info?.validation_photo_path}
            apiUrl={`${Constants.domain}/players/validation_photo?player_id=${player?.info?.id}`}
            onUploadSuccess={handleUploadSuccess}
            onDeletePhoto={handleDeletePhoto}
            maxFiles={3}
        />
        <InfoNote title='Фотовалидация'>
            <p>Для фотовалидации листов необходимо загрузить фото вашей армии на этом экране. Максимум можно загрузить 3 фотографии</p>
        </InfoNote>
        <InfoNote accent title='Дедлайн'>
            <p>Крайний срок подачи фото армии 23:59 2 ноября.</p>
        </InfoNote>
    </div>
}

export default Photovalidation