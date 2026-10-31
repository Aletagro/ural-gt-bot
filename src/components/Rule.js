import React from 'react'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import Ability from './Ability'
import {replaceAsterisks, removeAsterisks} from '../utilities/utils'

import map from 'lodash/map'
import filter from 'lodash/filter'

import Styles from './styles/Rule.module.css'

const dataBase = require('../dataBase.json')

const Rule = ({rule}) => {

    const handleClickRule = () => {
        if (rule.textContent) {
            navigator.clipboard.writeText(removeAsterisks(rule.textContent))
            toast.success('Rule Copied', Constants.toastParams)
        }
    }

    const renderAbility = (ability) => <Ability key={ability.id} ability={ability} abilityKeywordsName='ability_keyword' abilityIdName='abilityId' />

    const renderBullet = (bullet) => <p id={Styles.bullet} key={bullet.id}>
        <span id={Styles.bulletMark} />
        <span>{replaceAsterisks(bullet.text)}</span>
    </p>

    const renderContent = () => {
        console.log(rule)
        switch (rule.contentType) {
            case 'text':
                return <p id={Styles.text} key={rule.id}>{replaceAsterisks(rule.textContent)}</p>
            case 'header':
                return <h4 id={Styles.heading} key={rule.id}>{replaceAsterisks(rule.textContent)}</h4>
            case 'textBold':
                return <b id={Styles.textBold} key={rule.id}>{replaceAsterisks(rule.textContent)}</b>
            case 'textItalic':
                return <p id={Styles.textItalic} key={rule.id}>{replaceAsterisks(rule.textContent)}</p>
            case 'boxedText':
                return <div id={Styles.box} key={rule.id}><p>{replaceAsterisks(rule.textContent)}</p></div>
            case 'accordion':
                return <div id={Styles.box} key={rule.id}>
                    <h4 id={Styles.boxTitle}>{rule.title}</h4>
                    <p>{replaceAsterisks(rule.textContent)}</p>
                </div>
            case 'loreAccordion':
                    return <p id={Styles.textItalic} key={rule.id}>{replaceAsterisks(rule.textContent)}</p>
            case 'image':
                return <img id={Styles.image} src={rule.imageUrl} alt={rule.altText} />
            case 'ability':
                const abilities = filter(dataBase.data.ability, (ability) => ability.id === rule.abilityId)
                return map(abilities, renderAbility)
            case 'bullets':
                const bullets = filter(dataBase.data.bullet_point, (point) => point.ruleContainerComponentId === rule.id)
                bullets.sort((a, b) => a.displayOrder - b.displayOrder)
                return <div id={Styles.box}>
                    {map(bullets, renderBullet)}
                </div>
            default:
                return null
        }
    }

    return <button id={Styles.container} onClick={handleClickRule}>
        {renderContent()}
        <ToastContainer />
    </button>
}

export default Rule