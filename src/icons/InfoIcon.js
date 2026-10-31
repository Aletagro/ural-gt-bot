import React from 'react'

/**
 * Иконка «i» в круге, рисуется линией и берёт цвет текста (currentColor).
 * size      - размер в пикселях
 * className - класс для svg
 */
const InfoIcon = ({size = 24, className}) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={className}
        aria-hidden='true'
    >
        <circle cx='12' cy='12' r='9' />
        <path d='M12 11v5M12 8h.01' />
    </svg>
)

export default InfoIcon
