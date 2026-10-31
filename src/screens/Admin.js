import React, {useState, useCallback, useReducer} from 'react'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {getApiErrorMessage} from '../utilities/apiError'
import Constants from '../Constants'
import {setTournamentStatus} from '../utilities/utils'
import FloatingLabelInput from '../components/FloatingLabelInput'
import {players, meta} from '../utilities/appState'
import {useRosterPdf} from '../utilities/useRosterPdf'
import {fetchMeta} from '../utilities/applyMeta'
import {getNewEndsAt, getShiftedEndsAt, ADJUST_STEP_MIN} from '../utilities/roundTimer'
import RoundTimer from '../components/RoundTimer'
import Section from '../components/Section'
import ToggleRow from '../components/ToggleRow'
import Modal from '../components/Modal'
import {ModalActions, ModalButton} from '../components/ModalActions'

import map from 'lodash/map'
import find from 'lodash/find'
import size from 'lodash/size'
import trim from 'lodash/trim'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'

import Styles from './styles/Admin.module.css'
import Button from '../components/Button'

const Admin = () => {
    // eslint-disable-next-line
    const [_, forceUpdate] = useReducer((x) => x + 1, 0)
    const [pairings, setPairings] = useState({})
    const [playersForChange, setPlayersForChange] = useState([])
    const isChangeButtonDisabled = size(playersForChange) !== 2
    const [message, setMessage] = useState('')
    const {start: handleDownloadRosters, isBuilding: pdfLoading, readyModal} = useRosterPdf()
    const [boardLink, setBoardLink] = useState('')
    const [pending, setPending] = useState({})
    const [confirmData, setConfirmData] = useState({visible: false, title: ''})
    const [pairingsError, setPairingsError] = useState('')

    const closeConfirm = () => setConfirmData({visible: false, title: ''})

    // Окно подтверждения для действий, которые видят все игроки или которые нельзя отменить
    const askConfirm = (title, confirmLabel, onConfirm) => setConfirmData({
        visible: true,
        title,
        Content: () => <ModalActions>
            <ModalButton onClick={closeConfirm}>Отмена</ModalButton>
            <ModalButton type='primary' onClick={() => {
                closeConfirm()
                onConfirm()
            }}>{confirmLabel}</ModalButton>
        </ModalActions>
    })

    const handleCreateParings = useCallback(async () => {
        setPairingsError('')
        try {
            const response = await fetch(`${Constants.domain}/parings/?next_round=${meta.round + 1}`)
            if (!response.ok) {
                const message = await getApiErrorMessage(response)
                setPairingsError(message)
                toast.error(`Паринги не созданы: ${message}`, {...Constants.toastParams, autoClose: 10000})
                return
            }
            setPairings(await response.json())
        } catch (error) {
            console.error(error)
            const message = 'Нет связи с сервером. Проверьте интернет и попробуйте ещё раз'
            setPairingsError(message)
            toast.error(message, Constants.toastParams)
        }
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
        await fetchMeta()
        forceUpdate()
    }, [])

    const handleChangeRoundActiveMeta = useCallback(async () => {
        const isStarting = !meta.isRoundActive
        await fetch(`${Constants.domain}/tournament-meta/`, {
            method: 'PUT',
            body: JSON.stringify({isRoundActive: isStarting}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json, text/javascript, /; q=0.01"
            }
        })
            .then(async () => {
                toast.success(isStarting ? 'Раунд начался' : 'Раунд окончен', Constants.toastParams)
                // Таймер ставим отдельным запросом: если сервер его пока не поддерживает, сам старт раунда это не сломает
                try {
                    const response = await fetch(`${Constants.domain}/tournament-meta/`, {
                        method: 'PUT',
                        body: JSON.stringify({roundEndsAt: isStarting ? getNewEndsAt(meta.clockOffset) : null}),
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': "application/json, text/javascript, /; q=0.01"
                        }
                    })
                    if (!response.ok) throw new Error(`HTTP ${response.status}`)
                } catch (error) {
                    console.error(error)
                    toast.warning('Таймер раунда не обновился', Constants.toastParams)
                }
                handleGetMeta()
            })
            .catch(error => console.error(error))
    }, [handleGetMeta])

    // Судья добавляет или убирает минуты (deltaMin) либо запускает таймер, если раунд идёт без него
    const handleChangeTimer = (deltaMin) => async () => {
        const roundEndsAt = meta.roundEndsAt
            ? getShiftedEndsAt(meta.roundEndsAt, deltaMin)
            : getNewEndsAt(meta.clockOffset)
        try {
            const response = await fetch(`${Constants.domain}/tournament-meta/`, {
                method: 'PUT',
                body: JSON.stringify({roundEndsAt}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json, text/javascript, /; q=0.01"
                }
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            toast.success(meta.roundEndsAt ? 'Время раунда изменено' : 'Таймер запущен', Constants.toastParams)
            await handleGetMeta()
        } catch (error) {
            console.error(error)
            toast.error('Не удалось изменить время', Constants.toastParams)
        }
    }

    // Ссылка на большой экран. Берём адрес приложения без хвоста Telegram (после #)
    const handleCopyBoardLink = async () => {
        const link = `${window.location.href.split('#')[0]}#/board`
        try {
            await navigator.clipboard.writeText(link)
            toast.success('Ссылка на большой экран скопирована', Constants.toastParams)
            setBoardLink('')
        } catch (error) {
            // в некоторых окнах Telegram буфер недоступен: показываем ссылку, её можно скопировать вручную
            setBoardLink(link)
        }
    }

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

    // Переключатель меняется сразу, а при ошибке сервера возвращается обратно
    const handleChangeMetaParam = useCallback((param) => async () => {
        const previous = meta[param]
        setPending((prev) => ({...prev, [param]: true}))
        meta[param] = !previous
        forceUpdate()
        try {
            const response = await fetch(`${Constants.domain}/tournament-meta/`, {
                method: 'PUT',
                body: JSON.stringify({[param]: !previous}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json, text/javascript, /; q=0.01"
                }
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            await handleGetMeta()
        } catch (error) {
            console.error(error)
            meta[param] = previous
            forceUpdate()
            toast.error('Не удалось сохранить настройку', Constants.toastParams)
        } finally {
            setPending((prev) => ({...prev, [param]: false}))
        }
    }, [handleGetMeta])

    const handleSendMessage = useCallback(async () => {
        try {
            const response = await fetch(`${Constants.domain}/messages/send_mas_message/?message=${encodeURIComponent(message)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json, text/javascript, /; q=0.01"
                }
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            setMessage('')
            toast.success('Сообщение всем игрокам отправлено', Constants.toastParams)
        } catch (error) {
            console.error(error)
            toast.error('Сообщение не отправлено, текст сохранён. Попробуйте ещё раз', Constants.toastParams)
        }
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

        return <div key={index} className={tableClass}>
            <div className={Styles.tableHeader}>
                <span className={Styles.tableName}>Стол {index}</span>
                <div className={Styles.badges}>
                    {alreadyPlayed && <span className={Styles.badgeAlready} title="Уже играли!">Уже играли</span>}
                    {isSameCity && <span className={Styles.badgeCity} title="Игроки из одного города">{player1.city}</span>}
                    {isSameFaction && <span className={Styles.badgeMirror} title="Зеркальный матч армий!">Зеркало</span>}
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
        <Button
            className={Styles.sendMessageButton}
            disabled={!trim(message)}
            onClick={() => askConfirm('Отправить сообщение всем игрокам?', 'Отправить', handleSendMessage)}
        >
            Отправить
        </Button>
    </div>

    const renderBattleplan = (battleplan) =>
        <Button
            key={battleplan.id}
            type={meta.battleplan === battleplan.title ? 'primary' : 'secondary'}
            size='sm'
            onClick={handleClickBattleplan(battleplan.title)}
        >
            {battleplan.title}
        </Button>

    const nextRound = meta.round + 1
    const toggles = [
        {param: 'isRegOpen', label: 'Регистрация открыта', hint: 'Игроки могут подать заявку на турнир'},
        ...(meta.round === 0 ? [{param: 'rostersBeingAccepted', label: 'Приём ростеров', hint: 'Игроки могут отправлять списки армий'}] : []),
        {param: 'isRostersShow', label: 'Ростеры видны всем', hint: 'Игроки видят списки друг друга'},
        {param: 'isTournamentRulesShow', label: 'Регламент виден всем'},
        {param: 'isPlayersListShow', label: 'Список участников виден всем'},
        {param: 'isChallengesOpen', label: 'Челленджи открыты', hint: 'Игроки могут бросать вызовы'}
    ]

    const renderToggle = ({param, label, hint}) => <ToggleRow
        key={param}
        label={label}
        hint={hint}
        checked={Boolean(meta[param])}
        disabled={Boolean(pending[param])}
        onChange={handleChangeMetaParam(param)}
    />

    const renderRoundControl = () => <>
        <div className={Styles.status}>
            <span className={Styles.statusLabel}>Сейчас</span>
            <b className={Styles.statusValue}>{setTournamentStatus(meta.isRoundActive, meta.round)}</b>
        </div>
        {meta.isRoundActive
            ? <>
                <RoundTimer />
                {meta.roundEndsAt
                    ? <div id={Styles.timerButtons}>
                        <Button type='secondary' className={Styles.half} onClick={handleChangeTimer(-ADJUST_STEP_MIN)}>−{ADJUST_STEP_MIN} мин</Button>
                        <Button type='secondary' className={Styles.half} onClick={handleChangeTimer(ADJUST_STEP_MIN)}>+{ADJUST_STEP_MIN} мин</Button>
                    </div>
                    : <Button type='secondary' className={Styles.button} onClick={handleChangeTimer(0)}>Запустить таймер раунда</Button>
                }
            </>
            : null
        }
        {meta.isRoundActive
            ? <Button type='danger' className={Styles.button} onClick={() => askConfirm('Закончить раунд?', 'Закончить', handleChangeRoundActive)}>Закончить раунд</Button>
            : <Button className={Styles.button} onClick={handleChangeRoundActive}>Начать раунд для игроков</Button>
        }
    </>

    const renderPairings = () => <>
        <Button type={isEmpty(pairings) ? 'primary' : 'secondary'} className={Styles.button} onClick={handleCreateParings} disabled={meta.isRoundActive}>
            {isEmpty(pairings) ? `Создать паринги ${nextRound} раунда` : 'Создать заново'}
        </Button>
        {meta.isRoundActive ? <p className={Styles.note}>Пока идёт раунд, паринги следующего создать нельзя</p> : null}
        {pairingsError
            ? <div id={Styles.errorBox}>
                <b>Не удалось создать паринги</b>
                <p>{pairingsError}</p>
            </div>
            : null
        }
        {isEmpty(pairings)
            ? null
            : <>
                <p className={Styles.note}>Нажмите на двух игроков, чтобы поменять их местами</p>
                <div id={Styles.pairingsGrid}>
                    {map(pairings, renderTable)}
                </div>
                <Button type='secondary' className={Styles.button} onClick={handleChangePlayers} disabled={isChangeButtonDisabled}>
                    Поменять выбранных игроков ({size(playersForChange)} из 2)
                </Button>
                <Button className={Styles.button} onClick={() => askConfirm(`Принять паринги ${nextRound} раунда? Игроки увидят свои столы`, 'Принять', handleStartRound)}>
                    Принять паринги
                </Button>
            </>
        }
    </>

    return <div id='column' className={`Chapter ${Styles.admin}`}>
        <Section title='Раунд' hint='Ход турнира и таймер'>
            {renderRoundControl()}
        </Section>
        <Section title='Паринги' hint={`Подготовка ${nextRound} раунда`}>
            {renderPairings()}
        </Section>
        <Section title='Миссия' hint={meta.battleplan ? `Сейчас: ${meta.battleplan}` : 'Активная миссия не выбрана'}>
            <div id={Styles.battleplansContainer}>
                {map(Constants.tournamentBattleplans, renderBattleplan)}
            </div>
        </Section>
        <Section title='Сообщение игрокам' hint='Придёт всем участникам в Telegram'>
            {renderSendMessage()}
        </Section>
        <Section title='Что видят игроки' hint='Включите или отключите разделы приложения' collapsible defaultOpen={meta.round === 0}>
            {toggles.map(renderToggle)}
        </Section>
        <Section title='Инструменты' collapsible defaultOpen={false}>
            <Button type='soft' className={Styles.button} onClick={handleDownloadRosters} disabled={pdfLoading}>{pdfLoading ? 'Готовлю PDF…' : 'Скачать все ростеры (PDF)'}</Button>
            <Button type='soft' className={Styles.button} onClick={handleCopyBoardLink}>Скопировать ссылку на большой экран</Button>
            {boardLink ? <input id={Styles.boardLink} value={boardLink} readOnly onFocus={(e) => e.target.select()} /> : null}
        </Section>
        <Modal {...confirmData} onClose={closeConfirm} />
        <ToastContainer />
        {readyModal}
    </div>
}

export default Admin

const inputStyle = {
    'width': '100%',
}