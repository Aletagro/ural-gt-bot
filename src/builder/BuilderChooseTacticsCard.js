import React, {useReducer} from 'react'
import {useNavigate} from 'react-router-dom'
import {roster} from '../utilities/appState'
import {getStringAfterDash} from '../utilities/utils'
import Button from '../components/Button'
import Constants from '../Constants'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import filter from 'lodash/filter'
import includes from 'lodash/includes'

import Styles from './styles/BuilderChooseTacticsCard.module.css'

const dataBase = require('../dataBase.json')

const BuilderChooseTacticsCard = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const navigate = useNavigate()
    const tacticsCard = filter(dataBase.data.rule_container, container => container.ruleSectionId === Constants.tacticsCardPublicationId && includes(container.title, 'Battle Tactics Card'))

    const handleGoBack = () => {
        navigate(-1)
    }

    const handleClickCard = (tactic) => () => {
        navigate('/tactic', {state: {title: getStringAfterDash(tactic.title), tactic}})
    }

    const handleClickCheckbox = (card, isChecked) => () => {
        let newTactics = [...roster.tactics]
        if (isChecked) {
            newTactics = filter(roster.tactics, tactic => tactic.id !== card.id)
        } else if (size(newTactics) !== 2) {
            newTactics.push({...card, name: getStringAfterDash(card.title)})
        }
        roster.tactics = newTactics
        forceUpdate()
    }

    const chosenCount = size(roster.tactics)

    const renderTacticsCard = (card) => {
        const isChecked = Boolean(find(roster.tactics, ['id', card.id]))
        const isLocked = !isChecked && chosenCount >= 2
        return <div key={card.id} className={`${Styles.card} ${isChecked ? Styles.cardChecked : ''} ${isLocked ? Styles.cardLocked : ''}`}>
            <button type='button' className={Styles.name} onClick={handleClickCard(card)}>{getStringAfterDash(card.title)}</button>
            <button
                type='button'
                className={`${Styles.check} ${isChecked ? Styles.checkOn : ''}`}
                role='checkbox'
                aria-checked={isChecked}
                aria-label='Выбрать карточку'
                disabled={isLocked}
                onClick={handleClickCheckbox(card, isChecked)}
            >
                {isChecked
                    ? <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M5 12.5l4.5 4.5L19 7.5' /></svg>
                    : null
                }
            </button>
        </div>
    }

    return  <div id='column' className='Chapter'>
        <p className={Styles.counter}>Выбрано: {chosenCount} из 2</p>
        {map(tacticsCard, renderTacticsCard)}
        <Button className={Styles.backButton} type='secondary' onClick={handleGoBack}>Back</Button>
    </div>
}

export default BuilderChooseTacticsCard