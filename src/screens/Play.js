import React, {useState, useEffect, useReducer, useCallback, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import html2canvas from 'html2canvas'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {shareFile, getShareMessage} from '../utilities/shareFile'
import {player, players, meta} from '../utilities/appState'
import {getArmyImage} from '../utilities/utils'
import FloatingLabelInput from '../components/FloatingLabelInput'
import Checkbox from '../components/Checkbox'
import RoundTimer from '../components/RoundTimer'
import armyImages from '../images/armies'
import Constants from '../Constants'

import get from 'lodash/get'
import min from 'lodash/min'
import max from 'lodash/max'
import find from 'lodash/find'
import isNull from 'lodash/isNull'

import Styles from './styles/Play.module.css'
import Button from '../components/Button'

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
        fetch(`${Constants.domain}/rounds/play/?id=${player?.info?.id}&cur_round=${meta.round}`)
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
    }, [])

    const setPlayerImage = useCallback((isFirst) => {
        let playerImage = isFirst ? armyImages.Ironjawz : armyImages.StormcastEternals
        const player = isFirst ? 'firstPlayer' : 'secondPlayer'
        if (get(info, `${player}.roster`)) {
            const playerAllegiance = JSON.parse(get(info, `${player}.roster`))?.allegiance
            playerImage = getArmyImage(playerAllegiance) || playerImage
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
            fetch(`${Constants.domain}/rosters/`)
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
        await fetch(`${Constants.domain}/rounds/play/?cur_round=${info?.round}&cur_table=${info?.table}&vp_first=${firstPlayer}&vp_second=${secondPlayer}&minor_win=${minorWin || 0}`, {
            method: 'PUT'
        })
            .then(response => response.json())
            .then(data => {
                setIsFinished(true)
            })
            .catch(error => console.error(error))
    }, [firstPlayer, secondPlayer, info?.round, info?.table, minorWin])

    const handleJudgeCall = () => {
        fetch(`${Constants.domain}/messages/judges_call?id=${player?.info?.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => response.json())
            .catch(error => console.error(error))
    }

    const handleClickCheckbox = (value) => () => {
        setMinorWin(value)
    }

    const shareCache = useRef({key: null, file: null})

    const handleClickShare = useCallback(async () => {
        if (!bannerRef.current) return
        try {
            const key = JSON.stringify([info?.round, info?.first_player_tp, info?.second_player_tp, info?.results_submitted])
            if (shareCache.current.key !== key) {
                const canvas = await html2canvas(bannerRef.current, {
                    useCORS: true,
                    backgroundColor: '#000000'
                })
                const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
                if (!blob) throw new Error('Не удалось создать файл картинки')
                shareCache.current = {key, file: new File([blob], 'match-result.png', {type: 'image/png'})}
            }
            const shareText = info?.results_submitted
                ? `IceHammer 2026. Раунд ${info?.round}. ${info?.firstPlayer?.surname} ${info?.firstPlayer?.name} (${info.first_player_vp}) ${info.first_player_tp} - ${info.second_player_tp} (${info.second_player_vp}) ${info?.secondPlayer?.surname} ${info?.secondPlayer?.name}`
                : `IceHammer 2026. Раунд ${info?.round}. ${info?.firstPlayer?.surname} ${info?.firstPlayer?.name} vs ${info?.secondPlayer?.surname} ${info?.secondPlayer?.name}. Грядёт великая битва!`
            const status = await shareFile(shareCache.current.file, {
                title: `IceHammer 2026. Раунд ${meta?.round}`,
                text: shareText
            })
            const message = getShareMessage(status, 'картинкой')
            if (message) toast.error(message, Constants.toastParams)
        } catch (error) {
            console.error('Ошибка при подготовке картинки:', error)
            toast.error('Не получилось подготовить картинку', Constants.toastParams)
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
                <div id={Styles.versus}>VS</div>
            </div>
            <img src={secondPlayerImage} id={Styles.secondImage} alt='secondImage' />
            <div id={Styles.playersNameContainer}>
                {firstPlayerName ? <p id={Styles.firstPlayerName}>{firstPlayerName}</p> : null}
                {secondPlayerName ? <p id={Styles.secondPlayerName}>{secondPlayerName}</p> : null}
            </div>
        </div>
    }, [firstPlayerImage, secondPlayerImage, info])

    if (isFinished) {
        return <div id='column' className='Chapter'>
            <ToastContainer />
            <b id={Styles.result}>Результат вашей игры принят</b>
            {renderImageBlock()}
        </div>
    }

    return <div id='column' className='Chapter'>
        <ToastContainer />
        <RoundTimer />
        <b id={Styles.table}>Стол {info?.table}</b>
        {renderImageBlock()}
        {info?.results_submitted
            ? <div id={Styles.resultContainer}>
                <b>Результат игры</b>
                <p id={Styles.resultLabel}>{info.firstPlayer.surname} {info.firstPlayer.name} <b>({info.first_player_vp}) {info.first_player_tp} - {info.second_player_tp} ({info.second_player_vp})</b> {info.secondPlayer.surname} {info.secondPlayer.name}</p>
                <p id={Styles.resultNotice}>Вы можете пересдать результаты игры. Для этого просто отправьте новые результаты</p>
            </div>
            : null
        }
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
        <p id={Styles.noticed}>Будьте внимательны, вводятся ваши VP, набранные за игру, а не TO </p>
        <Button className={Styles.button} onClick={handleSendResult} disabled={disableButton}>
            Отправить Результаты
        </Button>
        <Button className={Styles.button} onClick={handleJudgeCall}>Вызвать Судью</Button>
    </div>
}

export default Play

// const _data = {
//     first_player_id: 1,
//     first_player_tp: 12,
//     first_player_vp: 73,
//     second_player_id: 2,
//     second_player_tp: 8,
//     second_player_vp: 72,
//     round: 1,
//     table: 20,
//     results_submitted: true
// }
