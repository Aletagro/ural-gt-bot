import React from 'react'
import GoldCheckmark from '../icons/goldCheckmark.svg'
import Checkmark from '../icons/checkmark.svg'

import Styles from './styles/Checkbox.module.css'

const Checkbox = ({onClick, checked, disabled, isGold}) => {   
    
    const handleClick = () => {
        if (!disabled && onClick) {
            onClick(!checked)
        }
    }

    return <button id={Styles.checkbox} onClick={handleClick}>
        {checked
            ? <div id={Styles.checkmarkIcon}>
                <img src={isGold ? GoldCheckmark : Checkmark} alt="" />
            </div>
            : <div id={disabled ? Styles.disabledCheckbox : Styles.uncheckedCheckbox} style={{'border-color': isGold ? '#FFFFFF' : ' rgb(46, 46, 49)'}}/>
        }
    </button>
}

export default Checkbox