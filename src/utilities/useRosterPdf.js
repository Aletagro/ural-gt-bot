import React, {useCallback, useState} from 'react'
import {toast} from 'react-toastify'

import Constants from '../Constants'
import Modal from '../components/Modal'
import {ModalActions, ModalButton} from '../components/ModalActions'
import {players} from './appState'
import {buildRostersPdf} from './exportRostersPdf'
import {shareFile, saveFile, canShareFile, getShareMessage} from './shareFile'

const TOURNAMENT_NAME = 'IceHammer 2026'
const FILE_NAME = `${TOURNAMENT_NAME}.pdf`

// Свежий список игроков: ростеры нужны актуальные, а players.data может быть пустым или старым
const loadPlayers = async () => {
    try {
        const response = await fetch(`${Constants.domain}/players/`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = await response.json()
        const data = Array.isArray(json) ? json : json?.data
        if (Array.isArray(data) && data.length) players.data = data
    } catch (error) {
        console.error(error)
    }
    return players.data
}

/**
 * PDF со всеми ростерами в два шага:
 *   1) нажатие на кнопку: собираем файл (это занимает несколько секунд);
 *   2) окно «Файл готов» с кнопкой: системное «Поделиться» разрешено только сразу после нажатия,
 *      поэтому после долгой сборки отправлять файл нужно уже по новому нажатию.
 * const {start, isBuilding, readyModal} = useRosterPdf()
 */
export const useRosterPdf = () => {
    const [isBuilding, setIsBuilding] = useState(false)
    const [ready, setReady] = useState(null) // {blob, file, count}

    const start = useCallback(async () => {
        if (isBuilding) return
        setIsBuilding(true)
        try {
            const data = await loadPlayers()
            const result = await buildRostersPdf(data, TOURNAMENT_NAME)
            if (!result) {
                toast.info('Нет ни одного ростера', Constants.toastParams)
                return
            }
            const file = new File([result.blob], FILE_NAME, {type: 'application/pdf'})
            setReady({blob: result.blob, file, count: result.count})
        } catch (error) {
            console.error(error)
            toast.error('Не удалось собрать PDF', Constants.toastParams)
        } finally {
            setIsBuilding(false)
        }
    }, [isBuilding])

    const handleClose = useCallback(() => setReady(null), [])

    const handleShare = useCallback(async () => {
        const status = await shareFile(ready.file, {title: FILE_NAME})
        const message = getShareMessage(status, 'файлом')
        if (message) toast.error(message, Constants.toastParams)
        if (status === 'shared') setReady(null)
    }, [ready])

    const handleSave = useCallback(() => {
        saveFile(ready.blob, FILE_NAME)
        toast.info('Если файл не появился, откройте приложение в обычном браузере', Constants.toastParams)
    }, [ready])

    const renderContent = () => <>
        <p style={{textAlign: 'center'}}>Ростеров в файле: {ready?.count}</p>
        <ModalActions>
            {ready && canShareFile(ready.file)
                ? <ModalButton variant='primary' onClick={handleShare}>Поделиться</ModalButton>
                : null
            }
            <ModalButton onClick={handleSave}>Скачать файл</ModalButton>
        </ModalActions>
    </>

    const readyModal = <Modal visible={Boolean(ready)} title='PDF с ростерами готов' Content={renderContent} onClose={handleClose} />

    return {start, isBuilding, readyModal}
}
