import React from 'react'

// Линейные значки достижений. Ключ задаётся в BADGES (utilities/playerCalc.js)
const ICONS = {
    trophy: <path d='M8 4h8v5a4 4 0 01-8 0V4zM8 6H5v1a3 3 0 003 3M16 6h3v1a3 3 0 01-3 3M12 13v4M8 20h8M10 17h4' />,
    medal: <><circle cx='12' cy='15' r='5' /><path d='M9.5 3.5L12 9M14.5 3.5L12 9' /></>,
    shield: <path d='M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3zM9 12l2 2 4-4' />,
    brush: <path d='M18 3l3 3-9 9-3-3 9-9zM9 12c-2.5 0-4 1.5-4 4 0 2-1 3-2 3.5C7 20 11 19 11 16' />,
    heart: <path d='M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z' />,
    mountain: <path d='M3 19l6-11 4 6 2-3 6 8H3z' />,
    diamond: <path d='M6 4h12l3 5-9 11L3 9l3-5zM3 9h18' />,
    chain: <path d='M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1' />,
    burst: <path d='M12 2l2 6 6-1-4 5 4 5-6-1-2 6-2-6-6 1 4-5-4-5 6 1 2-6z' />,
    snowflake: <path d='M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5' />,
    globe: <><circle cx='12' cy='12' r='9' /><path d='M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18' /></>,
    mirror: <><ellipse cx='12' cy='9' rx='6' ry='7' /><path d='M12 16v5M8 21h8M9 6l2-1' /></>,
    person: <><circle cx='12' cy='8' r='3.5' /><path d='M5 20c0-4 3-6 7-6s7 2 7 6' /></>,
    weight: <path d='M6 8h12l2 12H4L6 8zM9 8a3 3 0 116 0' />,
    feather: <path d='M20 4c-8 0-14 4-14 12l-2 4M20 4c0 8-4 12-12 12M10 14l6-6' />,
    target: <><circle cx='12' cy='12' r='9' /><circle cx='12' cy='12' r='5' /><circle cx='12' cy='12' r='1.5' /></>,
    scales: <path d='M12 4v16M6 20h12M5 8h14M5 8l-3 7a3.5 3.5 0 007 0L5 8zM19 8l-3 7a3.5 3.5 0 007 0l-4-7' />,
    home: <path d='M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6' />,
    cycle: <path d='M20 12a8 8 0 01-14 5M4 12a8 8 0 0114-5M18 3v4h-4M6 21v-4h4' />,
    compass: <><circle cx='12' cy='12' r='9' /><path d='M15.5 8.5l-2 5-5 2 2-5 5-2z' /></>,
    sword: <path d='M20 4l-9 9M16 4h4v4M7 13l4 4M5 19l3-3M3 21l2-2' />
}

const BadgeIcon = ({name, size = 26}) => <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    {ICONS[name]}
</svg>

export default BadgeIcon
