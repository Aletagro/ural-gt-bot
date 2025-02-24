import React from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {roster, search, navigationState, rostersStuck, rounds} from '../utilities/appState'
import Search from '../icons/search.svg'
import ArrowBack from '../icons/arrowBack.svg'
import Export from '../icons/export.svg'
import Home from '../icons/home.svg'

import Styles from './styles/Header.module.css'

const Header = () => {
    const navigate = useNavigate()
    const {pathname, state} = useLocation()

    const clearAppState = () => {
        if (pathname === '/builder') {
            roster.regiments = [{units: [], heroId: '', points: 0}]
            roster.generalRegimentIndex = null
            roster.battleFormation = null
            roster.withoutBattleFormation = false
            roster.points = 0
            roster.spellsLore = ''
            roster.prayersLore = ''
            roster.manifestationLore = ''
            roster.manifestationsList = []
            roster.factionTerrain = ''
            roster.auxiliaryUnits = []
            roster.regimentOfRenown = null
            roster.battleFormation = ''
            roster.requiredGeneral = null
            navigationState.isBuilder = false
        } else if (pathname === '/search') {
            search.value = ''
            search.Warscrolls = []
            search.Rules = []
            search.Allegiances = []
        }
    }

    const handleGoBack = () => {
        if (pathname === '/roster' && rostersStuck.count) {
            while (rostersStuck.count) {
                navigate(-1)
                rostersStuck.count = rostersStuck.count - 1
            }
            navigate(-1)
        } else if (pathname === '/rounds' && rounds.stuckCount) {
            while (rounds.stuckCount) {
                navigate(-1)
                rounds.stuckCount = rounds.stuckCount - 1
            }
            navigate(-1)
        } else {
            navigate(-1)
            clearAppState()
        }
    }

    const handleNavigateToSearch = () => {navigate('search')}

    const handleNavigateToExport = () => {navigate('export', {state: {title: 'Ростер'}})}

    const handleNavigateToHome = () => {
        navigate('/')
        clearAppState()
        rostersStuck.count = 0
        rounds.stuckCount = 0
    }

    const renderRightButton = () => {
        switch (pathname) {
            case '/search':
                return null
            case '/builder':
                return <button id={Styles.rightButton} onClick={handleNavigateToExport}><img src={Export} alt='' /></button>
            default:
                return <div id={Styles.rightButtons}>
                    <button id={Styles.rightButton} onClick={handleNavigateToSearch}><img src={Search} alt='' /></button>
                    {pathname === '/' || pathname === '/export' || navigationState.isBuilder
                        ? null
                        : <button id={Styles.rightButton} onClick={handleNavigateToHome}><img src={Home} alt='' /></button>
                    }
                </div>
        }
    }

    return <div id={Styles.header}>
        {pathname === '/'
            ? null
            : <button id={Styles.leftButton} onClick={handleGoBack}><img src={ArrowBack} alt='' /></button>
        }
        <p id={Styles.title}>{state?.title || 'Ural GT 2025'}</p>
        {renderRightButton()}
    </div>
}

export default Header