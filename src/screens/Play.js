import React, {useState, useEffect, useReducer, useCallback, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import html2canvas from 'html2canvas'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {shareFile, getShareMessage} from '../utilities/shareFile'
import {player, players, meta} from '../utilities/appState'
import {getArmyImage} from '../utilities/utils'
import FloatingLabelInput from '../components/FloatingLabelInput'
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
    'width': '100%',
    'marginBottom': '12px',
}

const Play = ({setShareAction}) => {
    const navigate = useNavigate()
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [firstPlayer, setFirstPlayer] = useState('')
    const [secondPlayer, setSecondPlayer] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [loadError, setLoadError] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [info, setInfo] = useState()
    const [minorWin, setMinorWin] = useState(null)
    const [firstPlayerImage, setFirstPlayerImage] = useState(null)
    const [secondPlayerImage, setSecondPlayerImage] = useState(null)
    const bannerRef = useRef(null)
    const battleplan = find(Constants.tournamentBattleplans, ['title', meta.battleplan])
    const tiebreakOptions = [
        {value: 1, label: info?.firstPlayer?.surname},
        {value: 0, label: 'Равное количество'},
        {value: 2, label: info?.secondPlayer?.surname}
    ]
    const disableButton = isSending || !firstPlayer || !secondPlayer || (firstPlayer === secondPlayer ? isNull(minorWin) : false)

    const applyInfo = (data) => {
        const firstPlayer = find(players.data, ['id', min([Number(data.first_player_id), Number(data.second_player_id)])])
        const secondPlayer = find(players.data, ['id', max([Number(data.first_player_id), Number(data.second_player_id)])])
        setInfo({
            ...data,
            firstPlayer,
            secondPlayer
        })
    }

    const loadInfo = useCallback(() => {
        if (!player?.info?.id) {
            setLoadError(true)
            return
        }
        setLoadError(false)
        fetch(`${Constants.domain}/rounds/play/?id=${player.info.id}&cur_round=${meta.round}`)
            .then(response => {
                if (!response.ok) throw new Error(`Ошибка загрузки игры: ${response.status}`)
                return response.json()
            })
            .then(applyInfo)
            .catch(error => {
                console.error(error)
                setLoadError(true)
            })
    }, [])

    useEffect(() => {
        loadInfo()
    }, [loadInfo])

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
                .then(response => {
                    if (!response.ok) throw new Error(`Ошибка загрузки ростеров: ${response.status}`)
                    return response.json()
                })
                .then(data => {
                    players.rosters = data
                    forceUpdate()
                })
                .catch(error => console.error(error))
        }
    }, [])

    // VP: только цифры, без ведущих нулей (одиночный 0 допустим)
    const normalizeVp = (value) => value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')

    const handleChangeFirstPlayerResult = (e) => {
        setFirstPlayer(normalizeVp(e.target.value))
    }

    const handleChangeSecondPlayerResult = (e) => {
        setSecondPlayer(normalizeVp(e.target.value))
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
        setIsSending(true)
        await fetch(`${Constants.domain}/rounds/play/?cur_round=${info?.round}&cur_table=${info?.table}&vp_first=${firstPlayer}&vp_second=${secondPlayer}&minor_win=${minorWin || 0}`, {
            method: 'PUT'
        })
            .then(response => {
                if (!response.ok) throw new Error(`Ошибка отправки результата: ${response.status}`)
                return response.json()
            })
            .then(() => {
                setIsFinished(true)
            })
            .catch(error => {
                console.error(error)
                toast.error('Не удалось отправить результат. Попробуйте ещё раз', Constants.toastParams)
                setIsSending(false)
            })
    }, [firstPlayer, secondPlayer, info?.round, info?.table, minorWin])

    const handleJudgeCall = () => {
        fetch(`${Constants.domain}/messages/judges_call?id=${player?.info?.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(`Ошибка вызова судьи: ${response.status}`)
                toast.success('Судья вызван. Скоро подойдёт к вашему столу', Constants.toastParams)
            })
            .catch(error => {
                console.error(error)
                toast.error('Не удалось вызвать судью. Позовите его голосом', Constants.toastParams)
            })
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
        {loadError
            ? <div id={Styles.loadError}>
                <p>Не удалось загрузить данные игры</p>
                <Button type='secondary' size='sm' onClick={loadInfo}>Повторить</Button>
            </div>
            : null
        }
        {info ? <b id={Styles.table}>Стол {info.table}</b> : null}
        {renderImageBlock()}
        {info?.results_submitted
            ? <div id={Styles.resultContainer}>
                <b id={Styles.resultLabel}>Результат игры</b>
                <p id={Styles.resultLabel}>{info.firstPlayer?.surname} {info.firstPlayer?.name} ({info.first_player_vp}) {info.first_player_tp} - {info.second_player_tp} ({info.second_player_vp}) {info.secondPlayer?.surname} {info.secondPlayer?.name}</p>
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
                    inputMode='numeric'
                    value={firstPlayer}
                />
                <Button type='secondary' size='sm' className={Styles.rosterButton} onClick={handleClickFirstPlayerRoster} disabled={!info?.firstPlayer}>
                    Ростер
                </Button>
            </div>
            <div id={Styles.playerContainer}>
                <FloatingLabelInput
                    style={inputStyle}
                    onChange={handleChangeSecondPlayerResult}
                    label={info?.secondPlayer?.surname}
                    inputMode='numeric'
                    value={secondPlayer}
                />
                <Button type='secondary' size='sm' className={Styles.rosterButton} onClick={handleClickSecondPlayerRoster} disabled={!info?.secondPlayer}>
                    Ростер
                </Button>
            </div>
        </div>
        {firstPlayer && firstPlayer === secondPlayer
            ? <div className={Styles.tiebreak}>
                <p className={Styles.tiebreakTitle}>Кто выполнил больше тактик</p>
                {tiebreakOptions.map(({value, label}) =>
                    <button
                        key={value}
                        type='button'
                        className={`${Styles.option} ${minorWin === value ? Styles.optionSelected : ''}`}
                        onClick={handleClickCheckbox(value)}
                    >
                        <span className={Styles.radio} />
                        {label}
                    </button>
                )}
            </div>
            : null
        }
        {battleplan
            ? <Button type='secondary' className={Styles.mission} onClick={handleClickBattleplan}>
                Миссия: {battleplan.title}
            </Button>
            : null
        }
        <p id={Styles.noticed}>Будьте внимательны: вводятся ваши VP, набранные за игру, а не TО</p>
        <Button className={Styles.button} onClick={handleSendResult} disabled={disableButton}>
            Отправить Результаты
        </Button>
        <Button className={Styles.button} onClick={handleJudgeCall} type='secondary'>
            Вызвать Судью
        </Button>
    </div>
}

export default Play
