import React from 'react'
import Row from '../components/Row'
import HeaderImage from '../components/HeaderImage'
import malekith from '../images/malekith.png'

import Styles from './styles/Main.module.css'

const Main = () => {
    return <>
        <HeaderImage src={malekith} alt='main' />
        <div id='column' className='Chapter'>
            <Row title='Rules' navigateTo='mainRules' />
            <Row title='Builder' navigateTo='chooseGrandAlliance' />
            {/* <Row title='Builder' navigateTo='lists' /> */}
            {/* <Row title='Battle Dashboard' navigateTo='singlePlayer' /> */}
            <Row title='Damage Calculator' navigateTo='calculator' />
            <Row title='Paste List' navigateTo='pasteList' />
            <p id={Styles.feedbackText}>Card number for support - 5536 9141 9279 5999 (Rukosuev Nikita)</p>
            <p id={Styles.feedbackText}>For feedback - @RukosuevKrasavchik</p>
            <p id={Styles.feedbackText}>The database was last updated on 12.06.2025</p>
        </div>
    </>
}

export default Main