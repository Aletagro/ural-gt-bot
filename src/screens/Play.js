import React, {useState, useEffect, useReducer, useCallback, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import html2canvas from 'html2canvas'
import {players, meta} from '../utilities/appState'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Checkbox from '../components/Checkbox'
import armyImages from '../images/armies'
import Constants from '../Constants'

import get from 'lodash/get'
import min from 'lodash/min'
import max from 'lodash/max'
import find from 'lodash/find'
import isNull from 'lodash/isNull'
import camelCase from 'lodash/camelCase'
import upperFirst from 'lodash/upperFirst'

import Styles from './styles/Play.module.css'

const dataBase = require('../dataBase.json')

const tg = window.Telegram?.WebApp

const inputStyle = {
    '--Input-minHeight': '48px',
    'width': '100%',
    'borderRadius': '4px',
    'marginBottom': '16px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}

const Play = ({setShareAction}) => {
    const navigate = useNavigate()
    const user = tg.initDataUnsafe?.user
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [firstPlayer, setFirstPlayer] = useState()
    const [secondPlayer, setSecondPlayer] = useState()
    const [isFinished, setIsFinished] = useState(false)
    const [info, setInfo] = useState()
    const [minorWin, setMinorWin] = useState(null)
    const [firstPlayerImage, setFirstPlayerImage] = useState(null)
    const [secondPlayerImage, setSecondPlayerImage] = useState(null)
    const bannerRef = useRef(null)
    const battleplan = find(Constants.tournamentBattleplans, ['title', meta.battleplan])
    const disableButton = !firstPlayer || !secondPlayer || (firstPlayer === secondPlayer ? isNull(minorWin) : false)

    useEffect(() => {
        fetch(`https://aoscom.online/rounds/play/?tg_id=${user?.id}&cur_round=${meta.round}`)
            .then(response => response.json())
            .then(data => {
                const firstPlayer = find(players.data, ['id',  min([Number(data.first_player_id), Number(data.second_player_id)])])
                const secondPlayer = find(players.data, ['id', max([Number(data.first_player_id), Number(data.second_player_id)])])
                setInfo({
                    ...data,
                    firstPlayer,
                    secondPlayer
                })
            })
            .catch(error => console.error(error))
    }, [user?.id])

    const setPlayerImage = useCallback((isFirst) => {
        let playerImage = isFirst ? armyImages.Ironjaws : armyImages.StormcastEternal
        const player = isFirst ? 'firstPlayer' : 'secondPlayer'
        if (get(info, `${player}.roster`)) {
            const playerAllegiance = JSON.parse(get(info, `${player}.roster`))?.allegiance
            const _playerImage = armyImages[upperFirst(camelCase(playerAllegiance))]
            if (_playerImage) {
                playerImage = _playerImage
            } else {
                const parentFactionKeywordId = find(dataBase.data.faction_keyword, ['name', playerAllegiance])?.parentFactionKeywordId
                const faction = find(dataBase.data.faction_keyword, ['id', parentFactionKeywordId])?.name
                if (faction) {
                    playerImage = armyImages[upperFirst(camelCase(faction))]
                }
            }
        }
        if (isFirst) {
            setFirstPlayerImage(playerImage)
        } else {
            setSecondPlayerImage(playerImage)
        }
    }, [info])
    
    useEffect(() => {
        setPlayerImage(true)
        setPlayerImage()
    }, [setPlayerImage, info])

    useEffect(() => {
        if (!players.rosters.length) {
            fetch('https://aoscom.online/rosters/')
                .then(response => response.json())
                .then(data => {
                    players.rosters = data
                    forceUpdate()
                })
        }
    }, [])

    const handleChangeFirstPlayerResult = (e) => {
        setFirstPlayer(e.target.value)
    }

    const handleChangeSecondPlayerResult = (e) => {
        setSecondPlayer(e.target.value)
    }

    const handleClickFirstPlayerRoster = () => {
        navigate('/roster', {state: {title: `${info.firstPlayer.surname} ${info.firstPlayer.name}`, playerId: info.firstPlayer.id, isInfo: true}})
    }

    const handleClickSecondPlayerRoster = () => {
        navigate('/roster', {state: {title: `${info.secondPlayer.surname} ${info.secondPlayer.name}`, playerId: info.secondPlayer.id, isInfo: true}})
    }

    const handleClickBattleplan = () => {
        navigate('/battleplan', {state: {title:battleplan.title, battleplan}})
    }

    const handleSendResult = useCallback(async () => {
        await fetch(`https://aoscom.online/rounds/play/?cur_round=${info?.round}&cur_table=${info?.table}&vp_first=${firstPlayer}&vp_second=${secondPlayer}&minor_win=${minorWin || 0}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .then(data => {
                setIsFinished(true)
            })
            .catch(error => console.error(error))
    }, [firstPlayer, secondPlayer, info?.round, info?.table, minorWin])

    const handleJudgeCall = () => {
        fetch(`https://aoscom.online/messages/judges_call?tg_id=${user?.id}`)
            .then(response => response.json())
            .catch(error => console.error(error))
    }

    const handleClickCheckbox = (value) => () => {
        setMinorWin(value)
    }

    const handleClickShare = useCallback(async () => {
        try {
          const canvas = await html2canvas(bannerRef.current, {
            useCORS: true,
            backgroundColor: '#000000'
          })
          canvas.toBlob(async (blob) => {
            if (!blob) {
              console.error('Не удалось создать файл картинки')
              return
            }
            const file = new File([blob], 'match-result.png', {type: 'image/png'})
            const shareText = `Раунд ${meta?.round}. ${info?.firstPlayer?.surname} ${info?.firstPlayer?.name} vs ${info?.secondPlayer?.surname} ${info?.secondPlayer?.name}`
    
            if (navigator.canShare && navigator.canShare({files: [file]})) {
              try {
                await navigator.share({
                    title: `IceHammer 2026. Раунд ${meta?.round}`,
                    text: shareText, 
                    files: [file]
                })
              } catch (error) {
                console.error('Ошибка системного шеринга:', error);
              }
            }
          }, 'image/png');
    
        } catch (error) {
          console.error('Ошибка системного шеринга:', error);
        }
    }, [info])

    useEffect(() => {
        if (firstPlayerImage) {
          setShareAction(() => handleClickShare)
        }
        return () => setShareAction(null)
    }, [firstPlayerImage, setShareAction, handleClickShare])

    const renderImageBlock = useCallback(() => {
        const firstPlayerName = info?.firstPlayer ? `${info?.firstPlayer?.surname} ${info?.firstPlayer?.name}` : undefined
        const secondPlayerName = info?.secondPlayer ? `${info?.secondPlayer?.surname} ${info?.secondPlayer?.name}` : undefined
        return <div id={Styles.imageContainer} ref={bannerRef}>
            <img src={firstPlayerImage} id={Styles.firstImage} alt='firstImage' />
            <div id={Styles.matchInfo}>
                {/* <div id={Styles.score}>10 : 10</div> */}
                <div id={Styles.versus}>VS</div>
            </div>
            <img src={secondPlayerImage} id={Styles.secondImage} alt='secondImage' />
            <div id={Styles.playersNameContainer}>
                {firstPlayerName ? <p id={Styles.firstPlayerName}>{firstPlayerName}</p> : null}
                {secondPlayerName ? <p id={Styles.secondPlayerName}>{secondPlayerName}</p> : null}
            </div>
            {/* <img src={logo} id={Styles.logo} alt='logo' /> */}
        </div>
    }, [firstPlayerImage, secondPlayerImage, info])

    if (isFinished) {
        return <div id='column' className='Chapter'>
            <b id={Styles.result}>Результат вашей игры принят</b>
            {renderImageBlock()}
        </div>
    }

    return <div id='column' className='Chapter'>
        <b id={Styles.table}>Стол 1{info?.table}</b>
        {renderImageBlock()}
        <div id={Styles.inputContainer}>
            <div id={Styles.playerContainer}>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeFirstPlayerResult}
                    label={info?.firstPlayer?.surname}
                    value={firstPlayer}
                />
                <button
                    id={Styles.rosterButton}
                    onClick={handleClickFirstPlayerRoster}
                >
                    Ростер
                </button>
            </div>
            <div id={Styles.playerContainer}>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeSecondPlayerResult}
                    label={info?.secondPlayer?.surname}
                    value={secondPlayer}
                />
                <button
                    id={Styles.rosterButton}
                    onClick={handleClickSecondPlayerRoster}
                >
                    Ростер
                </button>
            </div>
        </div>
        {firstPlayer && firstPlayer === secondPlayer
            ? <div>
                <p id={Styles.checkboxTitle}>Кто выполнил больше тактик</p>
                <div>
                    <div id={Styles.checkboxRow} onClick={handleClickCheckbox(1)}>
                        <Checkbox onClick={handleClickCheckbox(1)} checked={minorWin === 1} />
                        <p id={Styles.checkboxText}>{info?.firstPlayer?.surname}</p>
                    </div>
                    <div id={Styles.checkboxRow} onClick={handleClickCheckbox(0)}>
                        <Checkbox onClick={handleClickCheckbox(0)} checked={minorWin === 0} />
                        <p id={Styles.checkboxText}>Равное количество</p>
                    </div>
                    <div id={Styles.checkboxRow} onClick={handleClickCheckbox(2)}>
                        <Checkbox onClick={handleClickCheckbox(2)} checked={minorWin === 2} />
                        <p id={Styles.checkboxText}>{info?.secondPlayer?.surname}</p>
                    </div>
                </div>
            </div>
            : null
        }
        {battleplan
            ? <button
                id={Styles.rosterButton}
                onClick={handleClickBattleplan}
            >
                Миссиия: {battleplan.title}
            </button>
            : null
        }
        <button
            id={disableButton ? Styles.disableButton : Styles.button}
            onClick={handleSendResult}
            disabled={disableButton}
        >
            Отправить Результаты
        </button>
        <p id={Styles.noticed}>Будьте внимательны, вводятся ваши VP, набранные за игру, а не TO </p>
        <button id={Styles.button} onClick={handleJudgeCall}>Вызвать Судью</button>
    </div>
}

export default Play
