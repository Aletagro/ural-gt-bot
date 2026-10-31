import React, {useCallback} from 'react'
import {player} from '../utilities/appState'
import {addDomainForUrl} from '../utilities/utils'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import PhotoUploader from '../components/PhotoUploader'

import InfoNote from '../components/InfoNote'

const PaintVoteReg = () => {
    const url = player?.info?.paint_photo_path

    const handleUploadSuccess = useCallback((_url) => {
        if (!url) {
            toast.success('Заявка принята', Constants.toastParams)
        }
        player.info.paint_photo_path = _url
    }, [url])

    return <div id='column' className='Chapter'>
        <PhotoUploader
            onUploadSuccess={handleUploadSuccess}
            photoUrls={url ? [addDomainForUrl(url)] : undefined}
            apiUrl={`${Constants.domain}/vote/photo?player_id=${player?.info?.id}`}
        />
        {url
            ? <InfoNote title='Вы участвуете'><p>Вы участвуете в конкурсе покраса, не забудьте во второй день во время обеда выставить свою армию на указанных организаторами столах</p></InfoNote>
            : <InfoNote title='Конкурс покраса'><p>Чтобы принять участие в конкурсе покраса, обязательно загрузите сюда фотографию вашей армии</p></InfoNote>
        }
        <ToastContainer />
    </div>
}

export default PaintVoteReg