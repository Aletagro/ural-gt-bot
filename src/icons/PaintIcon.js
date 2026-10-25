import React from 'react'

/**
 * Иконка кисти (та же, что в paintChecked.svg).
 * crossed = true: кисть уменьшается, вокруг появляется круг и диагональная черта (знак «нет»).
 * size       - размер в пикселях
 * color      - цвет кисти
 * markColor  - цвет круга и черты
 * style      - любые inline-стили для svg (margin, flexShrink и т.д.)
 * className  - класс для svg
 * ...rest    - остальные пропсы (onClick, title, data-* и т.д.) уходят на svg
 */
const PaintIcon = ({size = 20, crossed = false, color = '#000', markColor = '#000', style, className, ...rest}) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width={size}
        height={size}
        viewBox='0 0 225 225'
        preserveAspectRatio='xMidYMid meet'
        aria-hidden='true'
        className={className}
        style={style}
        {...rest}
    >
        {crossed
            ? <circle cx='112.5' cy='112.5' r='104' fill='none' stroke={markColor} strokeWidth='14' />
            : null
        }
        {/* При crossed кисть уменьшается до 70% вокруг центра, чтобы поместиться в круг */}
        <g transform={crossed ? 'translate(112.5 112.5) scale(0.7) translate(-112.5 -112.5)' : undefined}>
            <g transform='translate(0,225) scale(0.1,-0.1)' fill={color} stroke='none'>
                <path d='M2176 2085 c-206 -124 -757 -550 -1086 -841 -146 -129 -214 -202 -267 -288 l-41 -68 53 -53 c29 -29 63 -71 75 -93 l23 -41 89 45 c92 46 150 95 332 283 307 316 938 1091 888 1091 -4 0 -34 -16 -66 -35z' />
                <path d='M563 796 c-105 -33 -168 -100 -254 -270 -34 -66 -77 -142 -96 -168 -42 -58 -127 -132 -173 -152 l-34 -14 68 -21 c258 -80 482 -46 621 93 58 58 123 181 148 278 l15 58 -38 62 c-20 35 -61 82 -89 106 -57 46 -90 52 -168 28z' />
            </g>
        </g>
        {crossed
            ? <line x1='38' y1='38' x2='187' y2='187' stroke={markColor} strokeWidth='14' strokeLinecap='round' />
            : null
        }
    </svg>
)

export default PaintIcon