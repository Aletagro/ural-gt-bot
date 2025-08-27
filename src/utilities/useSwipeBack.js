import {useEffect, useRef} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'

const useSwipeBack = () => {
    const navigate = useNavigate()
    const {pathname} = useLocation()
    const touchStart = useRef(null)
    const threshold = 100; // минимальное расстояние свайпа
    
    useEffect(() => {
        if (pathname !== '/') {
        const handleTouchStart = (e) => {
            // Начинаем отслеживать только от левого края экрана
            if (e.touches[0].clientX < 50) {
            touchStart.current = e.touches[0].clientX
            }
        }
    
        const handleTouchMove = (e) => {
            if (touchStart.current === null) return
            const currentX = e.touches[0].clientX
            const deltaX = currentX - touchStart.current
            // Свайп справа налево (положительное значение)
            if (deltaX > threshold) {
            navigate(-1);
            touchStart.current = null
            }
        }
    
        const handleTouchEnd = () => {
            touchStart.current = null
        }
    
        document.addEventListener('touchstart', handleTouchStart)
        document.addEventListener('touchmove', handleTouchMove)
        document.addEventListener('touchend', handleTouchEnd)
    
        return () => {
            document.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleTouchEnd)
        }
        }
    }, [navigate, pathname])

    return null
}

export default useSwipeBack