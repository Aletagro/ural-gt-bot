import React from 'react'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import {replaceAsterisks} from '../utilities/utils'

import upperFirst from 'lodash/upperFirst'

import Styles from './styles/BattleTactic.module.css'

const BattleTactic = ({tactic}) => {
    const borderColor = Constants.tacticsTypes[tactic.battleTacticType]

    const handlleClick = () => {
        const tacticText = `${upperFirst(tactic.battleTacticType)}: ${tactic.name}\nTactics: ${tactic.rulesText}`
        navigator.clipboard.writeText(tacticText)
        toast.success('Ability Copied', Constants.toastParams)
    }

    return <>
        <button id={Styles.battleTactic} onClick={handlleClick} style={{border: `1px solid ${borderColor}`}}>
            <div id={Styles.header} style={{background: borderColor}}>
                <b id={Styles.headerText}>{upperFirst(tactic.battleTacticType)}</b>
                <div id={Styles.valueContainer}>
                    <p id={Styles.value}>{tactic.victoryPoints}</p>
                </div>
            </div>
            <div id={Styles.container}>
                <h4 id={Styles.name}>{tactic.name}</h4>
                <p id={Styles.text}>{replaceAsterisks(tactic.rulesText)}</p>
            </div>
        </button>
        <ToastContainer />
    </>
}

export default BattleTactic