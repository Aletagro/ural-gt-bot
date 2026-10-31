import React, {useState, useEffect, useRef, useCallback} from 'react'

import map from 'lodash/map'
import size from 'lodash/size'

import Styles from './styles/PhotoGallery.module.css'

const SWIPE_MIN_PX = 50

const Icon = ({path}) => <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <path d={path} />
</svg>

// Фото армии: сетка превью и просмотр на весь экран со свайпом и стрелками (на клавиатуре тоже работают ← → и Esc)
const PhotoGallery = ({photos}) => {
    const [current, setCurrent] = useState(null)
    const touchStart = useRef(null)
    const total = size(photos)

    const close = useCallback(() => setCurrent(null), [])
    const goPrev = useCallback(() => setCurrent((prev) => (prev - 1 + total) % total), [total])
    const goNext = useCallback(() => setCurrent((prev) => (prev + 1) % total), [total])

    useEffect(() => {
        if (current === null) return undefined
        const handleKey = (e) => {
            if (e.key === 'Escape') close()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'ArrowRight') goNext()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [current, close, goPrev, goNext])

    const handleTouchStart = (e) => {
        touchStart.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e) => {
        if (touchStart.current === null) return
        const delta = e.changedTouches[0].clientX - touchStart.current
        touchStart.current = null
        if (Math.abs(delta) < SWIPE_MIN_PX || total < 2) return
        if (delta > 0) goPrev()
        else goNext()
    }

    const stop = (handler) => (e) => {
        e.stopPropagation()
        handler()
    }

    if (!total) return null

    return <div className={Styles.gallery}>
        <div className={Styles.grid}>
            {map(photos, (photo, index) =>
                <button key={photo} type='button' className={Styles.thumb} onClick={() => setCurrent(index)} aria-label={`Фото армии ${index + 1}`}>
                    <img src={photo} alt='' loading='lazy' />
                    <span className={Styles.thumbIndex}>{index + 1}</span>
                </button>
            )}
        </div>

        {current !== null
            ? <div className={Styles.viewer} onClick={close} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <button type='button' className={`${Styles.round} ${Styles.closeButton}`} onClick={stop(close)} aria-label='Закрыть'><Icon path='M6 6l12 12M18 6L6 18' /></button>
                {total > 1
                    ? <button type='button' className={`${Styles.round} ${Styles.prev}`} onClick={stop(goPrev)} aria-label='Предыдущее фото'><Icon path='M15 5l-7 7 7 7' /></button>
                    : null
                }
                <img className={Styles.photo} src={photos[current]} alt={`Фото армии ${current + 1}`} onClick={(e) => e.stopPropagation()} />
                {total > 1
                    ? <button type='button' className={`${Styles.round} ${Styles.next}`} onClick={stop(goNext)} aria-label='Следующее фото'><Icon path='M9 5l7 7-7 7' /></button>
                    : null
                }
                <span className={Styles.counter}>{current + 1} из {total}</span>
            </div>
            : null
        }
    </div>
}

export default PhotoGallery
