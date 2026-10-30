import {useCallback, useRef} from 'react'
import html2canvas from 'html2canvas'

import {buildShareText, buildShareFileName, TOURNAMENT_NAME} from './playerShareText'
import {shareFile} from './shareFile'

/**
 * Шеринг карточки игрока: снимает картинку (PlayerShareCard с ref) и отдаёт её в системное меню «Поделиться».
 *   const {shareRef, share} = usePlayerShare(card, isFinished, onFail)
 *   <PlayerShareCard ref={shareRef} card={card} isFinished={isFinished} />
 * onFail(status) вызывается, если поделиться не вышло: unsupported, denied, failed (см. utilities/shareFile.js).
 * Готовая картинка запоминается: если браузер отказал из-за долгой съёмки (denied), второе нажатие отправит её сразу.
 */
export const usePlayerShare = (card, isFinished, onFail) => {
    const shareRef = useRef(null)
    const isBusy = useRef(false)
    const cached = useRef({key: null, file: null})

    const share = useCallback(async () => {
        if (!card || !shareRef.current || isBusy.current) return
        isBusy.current = true
        try {
            const key = JSON.stringify([card.id, card.place, card.tpSum, card.record, card.badges?.earned?.length, isFinished])
            if (cached.current.key !== key) {
                const canvas = await html2canvas(shareRef.current, {
                    useCORS: true,
                    backgroundColor: '#000000',
                    scale: 3, // 360x450 в 1080x1350
                })
                const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
                if (!blob) {
                    console.error('Не удалось создать файл картинки')
                    if (onFail) onFail('failed')
                    return
                }
                cached.current = {key, file: new File([blob], buildShareFileName(card), {type: 'image/png'})}
            }

            const status = await shareFile(cached.current.file, {
                title: TOURNAMENT_NAME,
                text: buildShareText(card, isFinished),
            })
            if (onFail && ['unsupported', 'denied', 'failed'].includes(status)) onFail(status)
        } catch (error) {
            console.error('Ошибка при подготовке картинки:', error)
            if (onFail) onFail('failed')
        } finally {
            isBusy.current = false
        }
    }, [card, isFinished, onFail])

    return {shareRef, share}
}
