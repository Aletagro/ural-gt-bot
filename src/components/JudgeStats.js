import React, {useState} from 'react'
import map from 'lodash/map'

import Styles from './styles/RosterBlocks.module.css'

const COLLAPSED_COUNT = 6

const Block = ({title, hint, children}) => <div className={Styles.judgeBlock}>
    <p className={Styles.judgeTitle}>{title}</p>
    {hint ? <p className={Styles.sectionHint}>{hint}</p> : null}
    {children}
</div>

const DataChecks = ({checks}) => {
    const [expanded, setExpanded] = useState(false)
    const {items, pending, oneSided, missingOpponent} = checks
    const shown = expanded ? items : items.slice(0, COLLAPSED_COUNT)
    const hasNotes = pending || oneSided || missingOpponent

    return <Block
        title='Проверка данных'
        hint='Сумма ТО в игре должна быть 20, а счёт ТО должен соответствовать разнице VP по системе 20-0'
    >
        {items.length
            ? <>
                {map(shown, (item, index) =>
                    <div key={`${item.round}-${item.aName}-${index}`} className={Styles.issue}>
                        <p className={Styles.issueTitle}>
                            Раунд {item.round}{item.table ? `, стол ${item.table}` : ''}: {item.aName} против {item.bName}
                        </p>
                        <p className={Styles.issueText}>{item.text}</p>
                    </div>
                )}
                {items.length > COLLAPSED_COUNT
                    ? <button className={Styles.moreButton} onClick={() => setExpanded(!expanded)}>
                        {expanded ? 'Свернуть' : `Показать все (${items.length})`}
                    </button>
                    : null
                }
            </>
            : <p className={Styles.okText}>Расхождений в сыгранных играх не найдено</p>
        }
        {hasNotes
            ? <p className={Styles.rowMeta}>
                {pending ? `Без результата: ${pending}. ` : ''}
                {oneSided ? `Результат только у одного из двух: ${oneSided}. ` : ''}
                {missingOpponent ? `Соперника нет в списке игроков: ${missingOpponent}. ` : ''}
            </p>
            : null
        }
    </Block>
}

const Leaders = ({title, leaders}) => <div className={Styles.leaders}>
    <p className={Styles.leadersTitle}>{title}</p>
    {leaders.length
        ? map(leaders, (item, index) =>
            <p key={item.id} className={Styles.leaderRow}>
                {index + 1}. {item.fullName}
                <span className={Styles.rowSub}>{item.allegiance}</span>
                <b className={Styles.leaderVotes}>{item.votes}{item.place ? ` / место ${item.place}` : ''}</b>
            </p>
        )
        : <p className={Styles.rowMeta}>Голосов пока нет</p>
    }
</div>

const Votes = ({votes, paintLeaders, sportLeaders}) => <Block
    title='Покрас и спортивность'
    hint='Голоса, полученные игроками, по Гранд Альянсам. В скобках среднее на игрока'
>
    <div className={`${Styles.votesRow} ${Styles.votesHead}`}>
        <span>Альянс</span>
        <span>Игроков</span>
        <span>Покрас</span>
        <span>Спорт</span>
    </div>
    {map(votes, (row) =>
        <div key={row.name} className={Styles.votesRow}>
            <span className={Styles.votesName}>{row.name}</span>
            <span>{row.players}</span>
            <span>{row.paintTotal}{row.paintAvg !== null ? ` (${row.paintAvg})` : ''}</span>
            <span>{row.sportTotal}{row.sportAvg !== null ? ` (${row.sportAvg})` : ''}</span>
        </div>
    )}
    <Leaders title='Больше всего голосов за покрас' leaders={paintLeaders} />
    <Leaders title='Больше всего голосов за спортивность' leaders={sportLeaders} />
</Block>

const Tables = ({tables}) => {
    if (!tables.length) return null
    return <Block title='Столы' hint='Сколько игр прошло за столом и сколько VP там набирают'>
        <div className={`${Styles.tablesRow} ${Styles.votesHead}`}>
            <span>Стол</span>
            <span>Игр</span>
            <span>Ср. VP</span>
            <span>Разница VP</span>
        </div>
        {map(tables, (row) =>
            <div key={row.table} className={Styles.tablesRow}>
                <span className={Styles.roundNumber}>{row.table}</span>
                <span>{row.games}</span>
                <span>{row.avgVp ?? '–'}</span>
                <span>{row.avgVpDiff ?? '–'}</span>
            </div>
        )}
    </Block>
}

// Блок виден только судьям (проверку isJudge делает родитель)
const JudgeStats = ({checks, votes, paintLeaders, sportLeaders, tables}) => <section className={Styles.section}>
    <p className={Styles.sectionTitle}>Для судей</p>
    <p className={Styles.sectionHint}>Этот блок видят только судьи</p>
    <DataChecks checks={checks} />
    <Votes votes={votes} paintLeaders={paintLeaders} sportLeaders={sportLeaders} />
    <Tables tables={tables} />
</section>

export default JudgeStats
