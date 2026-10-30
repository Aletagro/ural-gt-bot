import {useLayoutEffect, useRef} from 'react'
import {useNavigationType} from 'react-router-dom'

// Позиции прокрутки экранов по ключу. Живут, пока открыто приложение
const positions = {}

/**
 * Возвращает экран на то место, где его оставили, когда человек вернулся назад (кнопка, жест, стрелка в шапке).
 * Если экран открыли заново (обычный переход), позиция сбрасывается и начинается с верха.
 *   const isReturning = useScrollRestore('players')
 * isReturning = true, когда экран открыт возвратом: например, чтобы не фокусировать поле поиска и не прыгать вверх.
 */
export const useScrollRestore = (key) => {
    const navigationType = useNavigationType()
    const target = useRef(null)
    if (target.current === null) {
        const isBack = navigationType === 'POP'
        target.current = isBack ? positions[key] || 0 : 0
        if (!isBack) delete positions[key]
    }

    useLayoutEffect(() => {
        const position = target.current
        if (!position) return undefined
        // список рисуется не мгновенно, поэтому пробуем несколько кадров, пока страница не станет достаточно высокой
        let frame
        let attempts = 0
        const restore = () => {
            window.scrollTo(0, position)
            attempts += 1
            if (Math.abs(window.scrollY - position) > 2 && attempts < 15) frame = requestAnimationFrame(restore)
        }
        restore()
        return () => cancelAnimationFrame(frame)
    }, [])

    // Запоминаем прокрутку в момент ухода с экрана: layout-эффект успевает прочитать её до смены страницы
    useLayoutEffect(() => () => {
        positions[key] = window.scrollY
    }, [key])

    return target.current > 0
}
