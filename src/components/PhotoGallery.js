import React, {useState, useEffect, useRef, useCallback} from 'react'

import map from 'lodash/map'
import size from 'lodash/size'

import Styles from './styles/PhotoGallery.module.css'

const SWIPE_MIN_PX = 50
const MAX_SCALE = 5
const DOUBLE_TAP_MS = 300
const DOUBLE_TAP_SCALE = 2.5
const TAP_SLOP_PX = 10
const RESET_TRANSFORM = {scale: 1, x: 0, y: 0, animate: true}

const getDistance = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
const getMiddle = (a, b) => ({x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2})
const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// Вертикальный свайп Telegram закрывает Mini App: пока фото открыто (и его двигают пальцем), отключаем его
const setTelegramSwipes = (isEnabled) => {
    const tg = window.Telegram?.WebApp
    if (!tg?.isVersionAtLeast?.('7.7')) return
    if (isEnabled) tg.enableVerticalSwipes?.()
    else tg.disableVerticalSwipes?.()
}

const Icon = ({path}) => <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <path d={path} />
</svg>

// Фото армии: сетка превью и просмотр на весь экран со свайпом и стрелками (на клавиатуре тоже работают ← → и Esc)
const PhotoGallery = ({photos}) => {
    const [current, setCurrent] = useState(null)
    const [transform, setTransform] = useState(RESET_TRANSFORM)
    const transformRef = useRef(RESET_TRANSFORM)
    const gesture = useRef({mode: null})
    const lastTap = useRef(0)
    const photoRef = useRef(null)
    const total = size(photos)

    const applyTransform = useCallback((next) => {
        transformRef.current = next
        setTransform(next)
    }, [])

    // Двигать увеличенное фото можно только в пределах экрана
    const clampTranslate = useCallback((scale, x, y) => {
        const photo = photoRef.current
        const maxX = photo ? Math.max(0, (photo.offsetWidth * scale - window.innerWidth) / 2) : 0
        const maxY = photo ? Math.max(0, (photo.offsetHeight * scale - window.innerHeight) / 2) : 0
        return {x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY)}
    }, [])

    const resetZoom = useCallback(() => applyTransform(RESET_TRANSFORM), [applyTransform])

    const close = useCallback(() => setCurrent(null), [])

    // При смене фото и при закрытии масштаб сбрасывается
    useEffect(() => {
        applyTransform({scale: 1, x: 0, y: 0, animate: false})
    }, [current, applyTransform])

    useEffect(() => {
        if (current === null) return undefined
        setTelegramSwipes(false)
        return () => setTelegramSwipes(true)
    }, [current === null]) // eslint-disable-line react-hooks/exhaustive-deps
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

    const startPan = (touch) => {
        gesture.current = {mode: 'pan', lastX: touch.clientX, lastY: touch.clientY}
    }

    const handleTouchStart = (e) => {
        const {touches} = e
        const now = transformRef.current
        if (touches.length === 2) {
            gesture.current = {
                mode: 'pinch',
                startDistance: getDistance(touches[0], touches[1]),
                startMiddle: getMiddle(touches[0], touches[1]),
                startScale: now.scale,
                startX: now.x,
                startY: now.y,
            }
        } else if (touches.length === 1) {
            if (now.scale > 1) {
                startPan(touches[0])
            } else {
                gesture.current = {mode: 'swipe', startX: touches[0].clientX, startY: touches[0].clientY}
            }
        }
    }

    const handleTouchMove = (e) => {
        const {touches} = e
        const g = gesture.current
        if (g.mode === 'pinch' && touches.length === 2) {
            const scale = clamp(g.startScale * getDistance(touches[0], touches[1]) / g.startDistance, 1, MAX_SCALE)
            const middle = getMiddle(touches[0], touches[1])
            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2
            const ratio = scale / g.startScale
            // точка под пальцами остаётся на месте, пока фото растягивается
            const x = (middle.x - centerX) - ratio * (g.startMiddle.x - centerX - g.startX)
            const y = (middle.y - centerY) - ratio * (g.startMiddle.y - centerY - g.startY)
            applyTransform({scale, ...clampTranslate(scale, x, y), animate: false})
        } else if (g.mode === 'pan' && touches.length === 1) {
            const {scale, x, y} = transformRef.current
            const next = clampTranslate(scale, x + touches[0].clientX - g.lastX, y + touches[0].clientY - g.lastY)
            g.lastX = touches[0].clientX
            g.lastY = touches[0].clientY
            applyTransform({scale, ...next, animate: false})
        }
    }

    const handleDoubleTap = (touch) => {
        const {scale} = transformRef.current
        if (scale > 1) {
            resetZoom()
            return
        }
        const x = (window.innerWidth / 2 - touch.clientX) * (DOUBLE_TAP_SCALE - 1)
        const y = (window.innerHeight / 2 - touch.clientY) * (DOUBLE_TAP_SCALE - 1)
        applyTransform({scale: DOUBLE_TAP_SCALE, ...clampTranslate(DOUBLE_TAP_SCALE, x, y), animate: true})
    }

    const handleTouchEnd = (e) => {
        const g = gesture.current
        // один палец убрали из щипка: остаток продолжает двигать фото
        if (e.touches.length > 0) {
            if (g.mode === 'pinch' && e.touches.length === 1) startPan(e.touches[0])
            return
        }
        gesture.current = {mode: null}
        const {scale} = transformRef.current
        if (g.mode === 'pinch' || g.mode === 'pan') {
            if (scale < 1.05) resetZoom()
            return
        }
        if (g.mode !== 'swipe') return
        const touch = e.changedTouches[0]
        const deltaX = touch.clientX - g.startX
        const deltaY = touch.clientY - g.startY
        if (Math.abs(deltaX) < TAP_SLOP_PX && Math.abs(deltaY) < TAP_SLOP_PX && e.target === photoRef.current) {
            const now = Date.now()
            if (now - lastTap.current < DOUBLE_TAP_MS) {
                lastTap.current = 0
                handleDoubleTap(touch)
            } else {
                lastTap.current = now
            }
            return
        }
        if (Math.abs(deltaX) < SWIPE_MIN_PX || total < 2) return
        if (deltaX > 0) goPrev()
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
            ? <div className={Styles.viewer} onClick={close} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}>
                <button type='button' className={`${Styles.round} ${Styles.closeButton}`} onClick={stop(close)} aria-label='Закрыть'><Icon path='M6 6l12 12M18 6L6 18' /></button>
                {total > 1
                    ? <button type='button' className={`${Styles.round} ${Styles.prev}`} onClick={stop(goPrev)} aria-label='Предыдущее фото'><Icon path='M15 5l-7 7 7 7' /></button>
                    : null
                }
                <img
                    ref={photoRef}
                    className={Styles.photo}
                    style={{transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transition: transform.animate ? 'transform 0.2s ease' : 'none'}}
                    src={photos[current]}
                    alt={`Фото армии ${current + 1}`}
                    draggable={false}
                    onClick={(e) => e.stopPropagation()}
                />
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
