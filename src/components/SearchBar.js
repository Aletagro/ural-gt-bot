import React from 'react'

import Styles from './styles/SearchBar.module.css'

// Строка поиска в стиле шапки. type 'header' - тёмная полоса под шапкой, 'inline' - светлая, внутри страницы
const SearchBar = ({onChange, placeholder = 'Поиск', type = 'header', defaultValue}) => {
    return <div className={type === 'inline' ? Styles.inlineBar : Styles.bar}>
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
