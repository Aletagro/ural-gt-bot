import {useCallback, useRef} from 'react'
import html2canvas from 'html2canvas'

import {buildShareText, buildShareFileName, TOURNAMENT_NAME} from './playerShareText'

/**
 * Шеринг карточки игрока: снимает картинку (PlayerShareCard с ref) и отдаёт её в системное меню «Поделиться».
 *   const {shareRef, share} = usePlayerShare(card, isFinished, onUnsupported)
 *   <PlayerShareCard ref={shareRef} card={card} isFinished={isFinished} />
 * onUnsupported вызывается, если устройство не умеет делиться файлами (например, показать toast)
 */
export const usePlayerShare = (card, isFinished, onUnsupported) => {
    const shareRef = useRef(null)
    const isBusy = useRef(false)

    const share = useCallback(async () => {
        if (!card || !shareRef.current || isBusy.current) return
        isBusy.current = true
        try {
            const canvas = await html2canvas(shareRef.current, {
                useCORS: true,
                backgroundColor: '#000000',
                scale: 3, // 360x450 в 1080x1350
            })
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
            if (!blob) {
                console.error('Не удалось создать файл картинки')
                return
            }
            const file = new File([blob], buildShareFileName(card), {type: 'image/png'})

            if (navigator.canShare && navigator.canShare({files: [file]})) {
                await navigator.share({
                    title: TOURNAMENT_NAME,
                    text: buildShareText(card, isFinished),
                    files: [file],
                })
            } else if (onUnsupported) {
                onUnsupported()
            }
        } catch (error) {
            // AbortError: человек закрыл меню «Поделиться», это не ошибка
            if (error?.name !== 'AbortError') console.error('Ошибка системного шеринга:', error)
        } finally {
            isBusy.current = false
        }
    }, [card, isFinished, onUnsupported])

    return {shareRef, share}
}
