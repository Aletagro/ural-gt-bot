import React, {useMemo} from 'react'
import {
    buildGames,
    getSides,
    calcGamesSummary,
    calcGrandAllianceStats,
    calcArmyStats,
    calcMatchupMatrix,
    calcRoundStats,
    calcRosterSlices,
    calcFacts,
    calcDataChecks,
    calcVotesByAlliance,
    calcVoteLeaders,
    calcTableStats,
    ROUNDS_COUNT,
} from '../utilities/gamesCalc'
import {player, players} from '../utilities/appState'
import {useFreshPlayers} from '../utilities/useFreshPlayers'
import GrandAllianceCards from '../components/GrandAllianceCards'
import ArmyRating from '../components/ArmyRating'
import MatchupMatrix from '../components/MatchupMatrix'
import RoundsStats from '../components/RoundsStats'
import RosterSlices from '../components/RosterSlices'
import FactsBlock from '../components/FactsBlock'
import JudgeStats from '../components/JudgeStats'

import Styles from './styles/GamesStats.module.css'

const Card = ({value, label, hint}) => <div className={Styles.card}>
    <p className={Styles.cardValue}>{value ?? '–'}</p>
    <p className={Styles.cardLabel}>{label}</p>
    {hint ? <p className={Styles.cardHint}>{hint}</p> : null}
</div>

// Вкладка внутри экрана статистики (обёртку Chapter даёт родитель)
const GamesStats = () => {
    const {status, data} = useFreshPlayers()

    const {games, issues, sides} = useMemo(() => {
        const {games, issues} = buildGames(data, ROUNDS_COUNT)
        return {games, issues, sides: getSides(games)}
    }, [data])

    const summary = useMemo(() => calcGamesSummary(games), [games])
    const allianceStats = useMemo(() => calcGrandAllianceStats(sides), [sides])
    const armyStats = useMemo(() => calcArmyStats(sides), [sides])
    const matrix = useMemo(() => calcMatchupMatrix(sides), [sides])
    const roundStats = useMemo(() => calcRoundStats(games, ROUNDS_COUNT), [games])
    const rosterSlices = useMemo(() => calcRosterSlices(sides), [sides])
    const facts = useMemo(() => calcFacts(games, sides), [games, sides])

    // Блок для судей считаем только судье
    const isJudge = Boolean(player?.isJudge)
    const judge = useMemo(() => {
        if (!isJudge) return null
        // место игрока в рейтинге: players.standing уже отсортирован с учётом всех тайбрейков
        const places = new Map()
        ;(players?.standing || []).forEach((item, index) => places.set(item.id, index + 1))
        return {
            checks: calcDataChecks(games, issues),
            votes: calcVotesByAlliance(data),
            paintLeaders: calcVoteLeaders(data, 'my_paint', places),
            sportLeaders: calcVoteLeaders(data, 'my_sport', places),
            tables: calcTableStats(games),
        }
    }, [isJudge, games, issues, data])

    if (status === 'loading' && !data.length) {
        return <p className={Styles.message}>Загружаю данные…</p>
    }

    return <div>
        {status === 'stale'
            ? <p className={Styles.warning}>Не удалось обновить данные, показаны сохранённые, они могут быть неактуальными</p>
            : null
        }
        {status === 'loading'
            ? <p className={Styles.note}>Обновляю данные…</p>
            : null
        }

        {summary.gamesCount
            ? <>
                <p className={Styles.title}>Итоги по сыгранным играм</p>
                <div className={Styles.cards}>
                    <Card value={summary.gamesCount} label='Игр сыграно' />
                    <Card value={`${summary.roundsPlayed} из ${ROUNDS_COUNT}`} label='Раундов' />
                    <Card value={summary.avgVp} label='Средний VP' hint='за игру одним игроком' />
                    <Card value={summary.avgVpDiff} label='Средняя разница VP' hint='между соперниками' />
                    <Card value={summary.draws} label='Ничьих' hint={`${summary.drawsPercent}% игр`} />
                    <Card value={summary.mirrors} label='Зеркальных игр' hint='одинаковая армия' />
                </div>

                <GrandAllianceCards alliances={allianceStats} />
                <MatchupMatrix matrix={matrix} />
                <ArmyRating armies={armyStats} />
                <RoundsStats rounds={roundStats} />
                <RosterSlices slices={rosterSlices} />
                <FactsBlock facts={facts} />
                {judge ? <JudgeStats {...judge} /> : null}

                <p className={Styles.footnote}>
                    Выбор армии и результат связаны не причинно: сильные игроки могут чаще брать определённые армии.
                    Чем меньше игр, тем менее надёжны проценты.
                </p>
            </>
            : <p className={Styles.message}>Статистика появится, когда будут сданы результаты первых игр</p>
        }

        {issues.pending
            ? <p className={Styles.note}>Результатов пока нет у игр: {issues.pending}</p>
            : null
        }
    </div>
}

export default GamesStats
