import React, {useEffect, useReducer, useState} from 'react'
import {rounds, players, meta, player} from '../utilities/appState'
import Rounds from './Rounds'
import ToggleRow from '../components/ToggleRow'

// Тестовый показ экрана «Раунды» с замоканными данными. Открывается из экрана Developer.
// При входе подменяет общие данные приложения, при выходе возвращает всё как было.
const SURNAMES = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов-Задунайский', 'Попов', 'Васильев', 'Соколов']
const NAMES = ['Алексей', 'Дмитрий', 'Сергей', 'Михаил', 'Константин', 'Андрей', 'Николай', 'Егор']

const buildPlayers = () => SURNAMES.map((surname, index) => ({
    id: index + 1,
    surname,
    name: NAMES[index],
    // раунды 1 и 2 сыграны, 3-й идёт: результатов ещё нет
    game_1_tp: [20, 5, 12, 8, 10, 10, 0, 20][index],
    game_2_tp: [14, 20, 6, 0, 15, 8, 5, 12][index],
    game_3_tp: 0,
}))

// первый элемент — пустая «нулевая» пара: стол нумеруется по индексу, начиная с 1
const buildRounds = () => ({
    1: [[0, 0], [1, 2], [3, 4], [5, 6], [7, 8]],
    2: [[0, 0], [1, 3], [2, 4], [5, 7], [6, 8]],
    3: [[0, 0], [1, 4], [2, 3], [5, 8], [6, 7]],
})

const RoundsPreview = () => {
    const [isJudge, setIsJudge] = useState(true)
    const [, forceUpdate] = useReducer((x) => x + 1, 0)

    useEffect(() => {
        const saved = {
            players: players.data,
            round1: rounds[1], round2: rounds[2], round3: rounds[3],
            selected: rounds.selected,
            metaRound: meta.round,
            isJudge: player.isJudge,
        }
        players.data = buildPlayers()
        Object.assign(rounds, buildRounds(), {selected: 3})
        meta.round = 3
        player.isJudge = true
        forceUpdate()
        return () => {
            players.data = saved.players
            rounds[1] = saved.round1
            rounds[2] = saved.round2
            rounds[3] = saved.round3
            rounds.selected = saved.selected
            meta.round = saved.metaRound
            player.isJudge = saved.isJudge
        }
    }, [])

    // выставляем сразу, до перерисовки: карточки читают player.isJudge во время рендера
    const handleToggleJudge = () => {
        player.isJudge = !isJudge
        setIsJudge(!isJudge)
    }

    return <div style={{padding: '8px 8px 0'}}>
        <ToggleRow
            label='Режим судьи'
            hint='Тест: нажмите на счёт, чтобы открыть изменение результата'
            checked={isJudge}
            onChange={handleToggleJudge}
        />
        {players.data.length ? <Rounds preview /> : null}
    </div>
}

export default RoundsPreview
