import React from 'react'

import Styles from './styles/SearchBar.module.css'

// Строка поиска в стиле шапки. variant 'header' - тёмная полоса под шапкой, 'inline' - светлая, внутри страницы
const SearchBar = ({onChange, placeholder = 'Поиск', variant = 'header', defaultValue}) => {
    return <div className={variant === 'inline' ? Styles.inlineBar : Styles.bar}>
        <input
            className={Styles.input}
            onChange={onChange}
            placeholder={placeholder}
            defaultValue={defaultValue}
            type='search'
            name='search'
            autoComplete='off'
            enterKeyHint='search'
        />
    </div>
}

export default SearchBar
