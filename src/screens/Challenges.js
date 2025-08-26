import React, {useEffect, useState, useReducer, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {player, players, search, meta} from '../utilities/appState'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useDebounce from '../utilities/useDebounce'
import Constants from '../Constants'
import Modal from '../components/Modal'

import map from 'lodash/map'
import size from 'lodash/size'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import lowerCase from 'lodash/lowerCase'

import Styles from './styles/Challenges.module.css'

const tg = window.Telegram.WebApp

const Challenges = () => {
    const navigate = useNavigate()
    const [showPLayers, setShowPLayers] = useState(false)
    const [searchValue, setSearchValue] = useState(search.playersValue)
    const [playersList, setPlayersList] = useState([])
    const [playerChallenges, setPlayerChallenges] = useState([])
    const [isPlayerChallengesGet, setIsPlayerChallengesGet] = useState(false)
    const [modalData, setModalData] = useState({visible: false, title: ''})
    const user = tg.initDataUnsafe?.user
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)

    useDebounce(() => {
        if (searchValue) {
            const _players = filter(players.data, (_player) => {
                const rosterInfo = JSON.parse(_player.roster_stat) || {}
                return (includes(lowerCase(`${_player.surname} ${_player.name}`), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo?.allegiance), lowerCase(searchValue)) ||
                    includes(lowerCase(rosterInfo.grandAlliance), lowerCase(searchValue)) ||
                    includes(lowerCase(_player.city), lowerCase(searchValue)))
                    && _player.challenge_status !== 'accepted'
                    && _player.id !== player.info?.id
            })
            setPlayersList(_players)
        } else {
            setPlayersList([])
        }
      }, [searchValue], 300
    )

    const handleGetChallenges = useCallback(async () => {
        await fetch('https://aoscom.online/challenges/')
            .then(response => response.json())
            .then(data => {
                players.сhallenges = data
            })
            .catch(error => console.error(error))
    }, [])

    useEffect(() => {
        if (!size(players.сhallenges)) {
            handleGetChallenges()
        }
    }, [handleGetChallenges])

    const handleMakeChallenge = () => {
        setShowPLayers(true)
    }

    const handleSearch = (e) => {
        search.playersValue = e.target.value
        setSearchValue(e.target.value)
    }

    const handleCloseModal = () => {
        setModalData({visible: false, title: '', text: ''})
    }

    const handleClickPlayer = (_player) => () => {
        setModalData({visible: true, title: `Вы уверен, что хотите бросить челлендж игроку: ${_player.surname} ${_player.name}?`, Content: renderChallengeModalConent(_player)})
    }

    const getPlayerInfo = useCallback(async () => {
        fetch(`https://aoscom.online/players/player/?tg_id=${user?.id}`)
            .then(response => response.json())
            .then(data => {
                player.info = data
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [user?.id])

    const handleGetPlayerChallenges = useCallback(async () => {
        await fetch(`https://aoscom.online/challenges/challenges_for_player/?player_id=${player?.info?.id}`)
            .then(response => response.json())
            .then(data => {
                setPlayerChallenges(data)
                setIsPlayerChallengesGet(true)
            })
            .catch(error => console.error(error))
    }, [])

    const handleCreateChallenge = useCallback(async (_player) => {
        await fetch(`https://aoscom.online/challenges/issue_a_challenge/?tg_id=${user?.id}&opp_id=${_player?.id}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .then(data => {
                getPlayerInfo()
                toast.success('Челлендж брошен!', Constants.toastParams)
            })
            .catch(error => console.error(error))
    }, [getPlayerInfo, user?.id])

    const handleAcceptChallenge = useCallback(async (_player) => {
        await fetch(`https://aoscom.online/challenges/accept_a_challenge/?tg_id=${user?.id}&opp_id=${_player?.id}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .then(data => {
                players.сhallenges = []
                getPlayerInfo()
                toast.success('Челлендж принят! Грядёт великая битва!', Constants.toastParams)
            })
            .catch(error => console.error(error))
    }, [getPlayerInfo, user?.id])

    const handleDeclineChallenge = useCallback(async (_player) => {
        await fetch(`https://aoscom.online/challenges/reject_a_challenge/?tg_id=${user?.id}&opp_id=${_player?.id}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .then(data => {
                players.сhallenges = filter(players.сhallenges, сhallenge => сhallenge.id !== _player?.id)
                handleGetPlayerChallenges()
                toast.success('Челлендж отменён', Constants.toastParams)
            })
            .catch(error => console.error(error))
    }, [user?.id, handleGetPlayerChallenges])

    const handleClickCreateChallenge = (_player) => () => {
        handleCloseModal()
        handleCreateChallenge(_player)
    }

    const handleClickAcceptChallenge = (_player) => () => {
        handleCloseModal()
        handleAcceptChallenge(_player)
    }

    const handleClickDeclineChallenge = (_player) => () => {
        handleCloseModal()
        handleDeclineChallenge(_player)
    }

    const handleOpenAcceptChallengeModal = (_player) => () => {
        setModalData({visible: true, title: `Вы уверен, что согласны с челленджем с игроком: ${_player.surname} ${_player.name}?`, Content: renderAcceptChallengeModalConent(_player)})
    }

    const handleOpenDeclineChallengeModal= (_player) => () => {
        setModalData({visible: true, title: `Вы уверен, что отказываетесь от челленджа с игроком: ${_player.surname} ${_player.name}?`, Content: renderDeclineChallengeModalConent(_player)})
    }

    const handleNavigateToPlayerInfo = (_player) => () => {
        if (meta.round || meta.isRostersShow || player.isJudge) {
            navigate('/playerInfo', {state: {player: _player, title: `${_player.surname} ${_player.name}`}})
        }
    }

    const renderChallengeModalConent = (_player) => () => <div>
        <button id={Styles.modalButton} onClick={handleClickCreateChallenge(_player)}>Да, я сокрушу его!</button>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Не, не, не! Этого воина я опасаюсь!</button>
    </div>

    const renderAcceptChallengeModalConent = (_player) => () => <div>
        <button id={Styles.modalButton} onClick={handleClickAcceptChallenge(_player)}>Да, я сокрушу его!</button>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет, мне нужно еще подумать!</button>
    </div>

    const renderDeclineChallengeModalConent = (_player) => () => <div>
        <button id={Styles.modalButton} onClick={handleClickDeclineChallenge(_player)}>Да, я не готов к этому бою!</button>
        <button id={Styles.modalButton} onClick={handleCloseModal}>Нет, мне нужно еще подумать!</button>
    </div>

    const renderRow = () => <div id={Styles.row} style={{'background': '#ECECEC'}}>
        <p id={Styles.smallColumn}>№</p>
        <p id={Styles.сolumn}>Первый Игрок</p>
        <p id={Styles.сolumn}>Второй Игрок</p>
    </div>

    const renderPlayer = (_player) => <div id={Styles.playerContainer} onClick={handleNavigateToPlayerInfo(_player)}>
        <p id={Styles.title}>{_player.surname} {_player.name}</p>
        {_player.city ? <p id={Styles.subtitle}>{_player.city}</p> : null}
    </div>

    const renderSearchPlayer = (_player, index) => <div key={_player.id} onClick={handleClickPlayer(_player)} id={Styles.searchPlayerContainer} style={{'background': `${index % 2 ? '#ECECEC' : ''}`}}>
        <p id={Styles.title}>{index + 1}. {_player.surname} {_player.name}</p>
        <p id={Styles.subtitle}>{_player.city}</p>
    </div>

    const renderChallenge = (сhallenge, index) => <div key={index} id={Styles.row} style={{'background': `${index % 2 ? '#ECECEC' : ''}`}}>
        <p id={Styles.smallColumn}>{index + 1}</p>
        {renderPlayer(сhallenge.player1)}
        {renderPlayer(сhallenge.player2)}
    </div>

    const renderPlayerChallenge = (_player, index) => <div key={_player.id} id={Styles.playerChallenge} style={{'background': `${index % 2 ? '' : '#ECECEC'}`}}>
        <div id={Styles.playerChallengeTitleContainer}>
            <p id={Styles.title}>{index + 1}. {_player.surname} {_player.name}</p>
            <p id={Styles.subtitle}>{_player.city}</p>
        </div>
        <div>
            <button id={Styles.playerChallengeButton} onClick={handleOpenAcceptChallengeModal(_player)}>Принять</button>
            <button id={Styles.playerChallengeButton} onClick={handleOpenDeclineChallengeModal(_player)}>Отказать</button>
        </div>
    </div>
    
    return <div id='column' className='Chapter'>
        {player.info?.challenge_status === 'accepted' || !player.info?.id
            ? null
            : <>
                {isPlayerChallengesGet
                    ? size(playerChallenges)
                        ? <div id={Styles.playerChallengesContainer}>
                            {map(playerChallenges, renderPlayerChallenge)}
                        </div>
                        : <p>Вам еще никто не бросил челлендж, возможно, что вас просто боятся!</p>
                    : <button id={Styles.button} onClick={handleGetPlayerChallenges}>Посмотреть кто бросил вам Челлендж</button>
                }
                {player.info?.challenge_status === 'sent'
                    ? null
                    : showPLayers
                        ? <div>
                            <div id={Styles.searchContainer}>
                                <input id={Styles.input} onChange={handleSearch} placeholder='Введите имя' autoFocus type='search' name='search' />
                            </div>
                            {map(playersList, renderSearchPlayer)}
                        </div>
                        : <button id={Styles.button} onClick={handleMakeChallenge}>Бросить Вызов!</button>
                }
            </>
        }
        {size(players.сhallenges)
            ? <div>
                <p id={Styles.listTitle}>Список Челленджей</p>
                {renderRow('№', 'Первый Игрок', 'Второй Игрок', true)}
                {map(players.сhallenges, renderChallenge)}
            </div>
            : <p id={Styles.listTitle}>Пока список челленджей пуст</p>
        }
        <Modal {...modalData} onClose={handleCloseModal} />
        <ToastContainer />
    </div>
}

export default Challenges