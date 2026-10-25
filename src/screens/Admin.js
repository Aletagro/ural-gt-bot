import React, {useState, useCallback, useReducer} from 'react'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Constants from '../Constants'
import {setTournamentStatus} from '../utilities/utils'
import FloatingLabelInput from '../components/FloatingLabelInput'
import {players, meta} from '../utilities/appState'
import {buildRostersPdf, deliverPdf} from '../utilities/exportRostersPdf'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import trim from 'lodash/trim'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'

import Styles from './styles/Admin.module.css'

const Admin = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [pairings, setPairings] = useState({})
    const [playersForChange, setPlayersForChange] = useState([])
    const isChangeButtonDisabled = size(playersForChange) !== 2
    const [message, setMessage] = useState('')
    const [pdfLoading, setPdfLoading] = useState(false)

    const handleCreateParings = useCallback(async () => {
        await fetch(`${Constants.domain}/parings/?next_round=${meta.round + 1}`)
            .then(response => response.json())
            .then(data => {
                setPairings(data)
            })
            .catch(error => console.error(error))
    }, [])

    const handleChangePlayers = useCallback(() => {
        const newPairings = {...pairings}
        const firstPlayer = playersForChange[0]
        const secondPlayer = playersForChange[1]
        const oldFirstPlayerTable = newPairings[firstPlayer.table]
        const oldSecondPlayerTable = newPairings[secondPlayer.table]
        const newCheckedPlayersTable = [firstPlayer.id, secondPlayer.id]
        const firstRemainingPlayer = find(oldFirstPlayerTable, p => p !== firstPlayer.id)
        const secondRemainingPlayer = find(oldSecondPlayerTable, p => p !== secondPlayer.id)
        const newRemainingPlayersTable = [firstRemainingPlayer, secondRemainingPlayer]
        newPairings[firstPlayer.table] = newCheckedPlayersTable.sort((a, b) => a - b)
        newPairings[secondPlayer.table] = newRemainingPlayersTable.sort((a, b) => a - b)
        setPairings(newPairings)
        setPlayersForChange([])
        toast.success('Паринги изменены', Constants.toastParams)
    }, [pairings, playersForChange])

    const handleGetMeta = useCallback(async () => {
        fetch(`${Constants.domain}/tournament-meta/`)
            .then(response => response.json())
            .then(data => {
                meta.round = data.round
                meta.isRoundActive = data.isRoundActive
                meta.rostersBeingAccepted = data.rostersBeingAccepted
                meta.isRostersShow = data.isRostersShow
                meta.isTournamentRulesShow = data.isTournamentRulesShow
                meta.isPlayersListShow = data.isPlayersListShow
                meta.isChallengesOpen = data.isChallengesOpen
                meta.isRegOpen = data.isRegOpen
                meta.battleplan = data.battleplan
                meta.playersLimit = data.playersLimit
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [])

    const handleChangeRoundActiveMeta = useCallback(async () => {
        await fetch(`${Constants.domain}/tournament-meta/`, {
            method: 'PUT',
            body: JSON.stringify({isRoundActive: !meta.isRoundActive}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                toast.success(meta.isRoundActive ? 'Раунд окончен' : 'Раунд начался', Constants.toastParams)
                handleGetMeta()
            })
            .catch(error => console.error(error))
    }, [handleGetMeta])

    const handleSetOppPower = useCallback(async () => {
        fetch(`${Constants.domain}/rounds/opp_power/`, {
            method: 'PUT'
        })
            .catch(error => console.error(error))
    }, [])

    const handleChangeRoundActive = useCallback(async () => {
        handleChangeRoundActiveMeta()
        if (meta.isRoundActive) {
            handleSetOppPower()
        }
    }, [handleChangeRoundActiveMeta, handleSetOppPower])

    const handleStartRoundMeta = useCallback(async () => {
        await fetch(`${Constants.domain}/tournament-meta/`, {
            method: 'PUT',
            body: JSON.stringify({round: meta.round + 1}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                handleGetMeta()
            })
            .catch(error => console.error(error))
    }, [handleGetMeta])


    const handleStartRound = useCallback(async () => {
        setPairings({})
        await fetch(`${Constants.domain}/parings/update_parings/?next_round=${meta.round + 1}`, {
            method: 'PUT',
            body: JSON.stringify(pairings),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                handleStartRoundMeta()
                toast.success('Раунд начался', Constants.toastParams)
            })
            .catch(error => {
                console.error(error)
                toast.error('Произошла ошибка, пиши Никите', Constants.toastParams)
            })
    }, [pairings, handleStartRoundMeta])

    const handleCheckPlayer = useCallback((playerId, table) => () => {
        setPlayersForChange((prevSelected) => {
          const isAlreadySelected = find(prevSelected, ['id', playerId])
          if (isAlreadySelected) {
            return filter(prevSelected, p => p.id !== playerId)
          }
          if (size(prevSelected) >= 2) {
            return prevSelected
          }
          return [...prevSelected, {id: playerId, table}]
        })
    }, [])

    const handleChangeMetaParam = useCallback((param) => async () => {
        await fetch(`${Constants.domain}/tournament-meta/`, {
            method: 'PUT',
            body: JSON.stringify({[param]: !meta[param]}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                handleGetMeta()
            })
            .catch(error => console.error(error))
    }, [handleGetMeta])

    const handleSendMessage = useCallback(async () => {
        setMessage('')
        await fetch(`${Constants.domain}/messages/send_mas_message/?message=${message}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                toast.success('Сообщение всем игрокам отправлено', Constants.toastParams)
                forceUpdate()
            })
            .catch(error => console.error(error))
      }, [message])

    const handleChangeMessage = (e) => {
        setMessage(e.target.value)
    }

    const handleSetBattleplan = useCallback(async (battleplan) => {
        await fetch(`${Constants.domain}/tournament-meta/`, {
            method: 'PUT',
            body: JSON.stringify({battleplan}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(() => {
                handleGetMeta()
            })
            .catch(error => console.error(error))
    }, [handleGetMeta])

    const handleClickBattleplan = (battleplan) => () => {
        handleSetBattleplan(battleplan)
    }

    const handleDownloadRosters = async () => {
        setPdfLoading(true)
        try {
            const result = await buildRostersPdf(players.data, 'IceHammer 2026')
            if (!result) return toast.info('Нет ни одного ростера')
            await deliverPdf(result.blob, 'rosters.pdf')
        } catch (e) {
            console.error(e)
            toast.error('Не удалось собрать PDF')
        } finally {
            setPdfLoading(false)
        }
    }

    const renderTable = useCallback((pairing, index) => {
        const player1 = find(players.data, ['id', pairing[0]])
        if (!player1) {
            return null
        }
        const player2 = find(players.data, ['id', pairing[1]])
        const p1Army = JSON.parse(player1?.roster_stat)?.allegiance
        const p2Army = JSON.parse(player2?.roster_stat)?.allegiance

        const isP1Selected = find(playersForChange, p => p.id === player1?.id)
        const isP2Selected = find(playersForChange, p => p.id === player2?.id)

        const alreadyPlayed = includes([player1.game_1_opp, player1.game_2_opp, player1.game_3_opp, player1.game_4_opp, player1.game_5_opp, player1.game_6_opp,], player2.id)
        const isSameCity = trim(player1.city) === trim(player2.city)
        const isSameFaction = p1Army === p2Army

        let tableClass = Styles.tableCard;
        if (alreadyPlayed) tableClass += ` ${Styles.alreadyPlayed}`
        else if (isSameCity) tableClass += ` ${Styles.conflictCity}`
        else if (isSameFaction) tableClass += ` ${Styles.conflictMirror}`;

        return <div className={tableClass}>
            <div className={Styles.tableHeader}>
                <span className={Styles.tableName}>Стол {index}</span>
                <div className={Styles.badges}>
                    {alreadyPlayed && <span className={Styles.badgeAlready} title="Уже играли!">🚫 Уже играли!</span>}
                    {isSameCity && <span className={Styles.badgeCity} title="Игроки из одного города">📍 {player1.city}</span>}
                    {isSameFaction && <span className={Styles.badgeMirror} title="Зеркальный матч армий!">⚔️ Mirror</span>}
                </div>
            </div>
            <div 
                className={`${Styles.playerRow} ${isP1Selected ? Styles.playerSelected : ''}`}
                onClick={handleCheckPlayer(player1?.id, index)}
            >
                <div className={Styles.playerInfo}>
                <span className={Styles.playerName}>{player1?.surname} {player1?.name}</span>
                <span className={Styles.playerFaction}>{p1Army}</span>
                </div>
                <div className={Styles.customCheck}>{isP1Selected ? '✓' : player1?.win}</div>
            </div>
            <div 
                className={`${Styles.playerRow} ${isP2Selected ? Styles.playerSelected : ''}`}
                onClick={handleCheckPlayer(player2?.id, index)}
            >
                <div className={Styles.playerInfo}>
                <span className={Styles.playerName}>{player2?.surname} {player2?.name}</span>
                <span className={Styles.playerFaction}>{p2Army}</span>
                </div>
                <div className={Styles.customCheck}>{isP2Selected ? '✓' : player2?.win}</div>
            </div>
        </div>
    }, [playersForChange, handleCheckPlayer])

    const renderSendMessage = () => <div id={Styles.sendMessageContainer}>
        <FloatingLabelInput
            style={inputStyle}
            onChange={handleChangeMessage}
            label='Cообщение всем игрокам'
            value={message}
        />
        <button id={Styles.sendMessageButton} onClick={handleSendMessage}>Отправить</button>
    </div>

    const renderBattleplan = (battleplan) =>
        <div
            key={battleplan.id}
            id={meta.battleplan === battleplan.title ? Styles.activeBattleplan : Styles.battleplan}
            onClick={handleClickBattleplan(battleplan.title)}
        >
            {battleplan.title}
        </div>

    return <div id='column' className='Chapter'>
        <b id={Styles.text}>Состояние турнира</b>
        <p id={Styles.text}>Статус: {setTournamentStatus(meta.isRoundActive, meta.round)}</p>
        {meta.round === 0
            ? <button id={Styles.button} onClick={handleChangeMetaParam('rostersBeingAccepted')}>{meta.rostersBeingAccepted ? 'Прекратить приём ростеров' : 'Начать принимать ростера'}</button>
            : null
        }
        <button id={Styles.button} onClick={handleChangeMetaParam('isRostersShow')}>{meta.isRostersShow ? 'Скрыть ростера' : 'Открыть ростера для всех'}</button>
        <button id={Styles.button} onClick={handleDownloadRosters} disabled={pdfLoading}>{pdfLoading ? 'Готовлю PDF…' : 'Скачать все ростеры (PDF)'}</button>
        <button id={Styles.button} onClick={handleChangeMetaParam('isTournamentRulesShow')}>{meta.isTournamentRulesShow ? 'Скрыть регламент' : 'Открыть регламент для всех'}</button>
        <button id={Styles.button} onClick={handleChangeMetaParam('isPlayersListShow')}>{meta.isPlayersListShow ? 'Скрыть список участников' : 'Открыть список участников для всех'}</button>
        <button id={Styles.button} onClick={handleChangeMetaParam('isChallengesOpen')}>{meta.isChallengesOpen ? 'Закрыть челленджи' : 'Открыть челленджи'}</button>
        <button id={Styles.button} onClick={handleChangeMetaParam('isRegOpen')}>{meta.isRegOpen ? 'Закрыть регистрацию' : 'Открыть регистрацию'}</button>
        <button id={meta.isRoundActive ? Styles.disableButton : Styles.button} onClick={handleCreateParings} disabled={meta.isRoundActive}>Создать паринги {meta.round + 1} раунда</button>
        {isEmpty(pairings)
            ? null
            : <>
                <b id={Styles.text}>Паринги</b>
                <div id={Styles.pairingsGrid}>
                    {map(pairings, renderTable)}
                </div>
                <button id={isChangeButtonDisabled ? Styles.disableButton : Styles.button} onClick={handleChangePlayers} disabled={isChangeButtonDisabled}>
                    Запарить выбранных игроков друг на друга
                </button>
                <button id={Styles.button} onClick={handleStartRound}>Принять паринги</button>
            </>
        }
        <button id={Styles.button} onClick={handleChangeRoundActive}>{meta.isRoundActive ? 'Закончить раунд' : 'Начать раунд для игроков'}</button>
        {renderSendMessage()}
        <b id={Styles.text}>Установить активную миссию</b>
        <div id={Styles.battleplansContainer}>
            {map(Constants.tournamentBattleplans, renderBattleplan)}
        </div>
        <ToastContainer />
    </div>
}

export default Admin

const inputStyle = {
    '--Input-minHeight': '48px',
    'width': '100%',
    'borderRadius': '4px',
    'borderColor': '#B4B4B4',
    'boxShadow': 'none',
    'fontFamily': 'Minion Pro Regular'
}