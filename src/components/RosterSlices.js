import React, {useState} from 'react'

import map from 'lodash/map'

import Styles from './styles/RosterBlocks.module.css'

const COLLAPSED_COUNT = 8

// 1 дроп, 2 дропа, 5 дропов
const pluralDrops = (n) => {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod10 === 1 && mod100 !== 11) return 'дроп'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дропа'
    return 'дропов'
}

const percentOf = (count, total) => (total ? (count / total) * 100 : 0)

const SliceRow = ({row, label, subtitle, showOwners}) => <div className={`${Styles.row} ${row.isSmall ? Styles.small : ''}`}>
    <div className={Styles.rowHeader}>
        <span className={Styles.rowName}>
            {label}
            {subtitle ? <span className={Styles.rowSub}>{subtitle}</span> : null}
        </span>
        <span className={Styles.rowValue}>{row.winRate ?? '–'}%</span>
    </div>
    <div className={Styles.track}>
        <div className={Styles.segWin} style={{width: `${percentOf(row.wins, row.games)}%`}} />
        <div className={Styles.segDraw} style={{width: `${percentOf(row.draws, row.games)}%`}} />
        <div className={Styles.segLoss} style={{width: `${percentOf(row.losses, row.games)}%`}} />
    </div>
    <p className={Styles.rowMeta}>
        {row.games} игр / {row.wins}-{row.draws}-{row.losses} / ТО {row.avgTp ?? '–'}
        {showOwners && row.players ? ` / в ${row.players} ростерах` : ''}
        {row.isSmall ? ' / мало игр' : ''}
    </p>
</div>

const Slice = ({title, hint, rows, getLabel, getSubtitle, showOwners, collapsible}) => {
    const [expanded, setExpanded] = useState(false)
    if (!rows.length) return null
    const shown = collapsible && !expanded ? rows.slice(0, COLLAPSED_COUNT) : rows

    return <section className={Styles.section}>
        <p className={Styles.sectionTitle}>{title}</p>
        {hint ? <p className={Styles.sectionHint}>{hint}</p> : null}
        {map(shown, (row) =>
            <SliceRow
                key={row.key ?? row.name}
                row={row}
                label={getLabel(row)}
                subtitle={getSubtitle ? getSubtitle(row) : null}
                showOwners={showOwners}
            />
        )}
        {collapsible && rows.length > COLLAPSED_COUNT
            ? <button className={Styles.moreButton} onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Свернуть' : `Показать все (${rows.length})`}
            </button>
            : null
        }
    </section>
}

// slices = calcRosterSlices(sides): {drops, wounds, formations, tactics}
const RosterSlices = ({slices}) => {
    const {drops, wounds, formations, tactics} = slices

    return <>
        <Slice
            title='Дропы'
            hint='Винрейт игроков с разным числом дропов. Игры при одинаковом числе дропов не учитываются'
            rows={drops}
            getLabel={(row) => `${row.name} ${pluralDrops(Number(row.name))}`}
        />
        <Slice
            title='Вунды'
            hint='Три группы примерно равного размера по числу вундов в ростере. Игры внутри одной группы не учитываются'
            rows={wounds}
            getLabel={(row) => `${row.name} вундов`}
        />
        <Slice
            title='Тактики'
            hint='Винрейт игроков, взявших карточку. Игры, где её взяли оба, не учитываются'
            rows={tactics}
            getLabel={(row) => row.name}
            showOwners
            collapsible
        />
        <Slice
            title='Боевые строи'
            hint='Игры, где у обоих один и тот же строй, не учитываются'
            rows={formations}
            getLabel={(row) => row.name}
            getSubtitle={(row) => row.army}
            collapsible
        />
    </>
}

export default RosterSlices
