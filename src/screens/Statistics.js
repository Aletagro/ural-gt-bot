import React, {useMemo, useState} from 'react'
import map from 'lodash/map'

import {players} from '../utilities/appState'
import {getArmyImage} from '../utilities/utils'
import {calcPreTournamentStats} from '../utilities/statsCalc'
import Constants from '../Constants'

import Styles from './styles/Statistics.module.css'

const DEFAULT_COLOR = '#8a6d1f'
const COLLAPSED_COUNT = 8

const Section = ({title, hint, children}) => <section className={Styles.section}>
    <p className={Styles.sectionTitle}>{title}</p>
    {hint ? <p className={Styles.sectionHint}>{hint}</p> : null}
    {children}
</section>

/**
 * rows: [{key, label, count, percent, color, imageSrc}]
 * Длина полосы считается от самого большого значения, чтобы различия были заметны.
 */
const BarList = ({rows, collapsible = false}) => {
    const [expanded, setExpanded] = useState(false)
    const shown = collapsible && !expanded ? rows.slice(0, COLLAPSED_COUNT) : rows

    return <div>
        {map(shown, (row) =>
            <div key={row.key} className={Styles.barRow}>
                {row.imageSrc !== undefined
                    ? row.imageSrc
                        ? <img className={Styles.thumb} src={row.imageSrc} alt={row.label} />
                        : <span className={Styles.thumb} />
                    : null
                }
                <div className={Styles.barBody}>
                    <div className={Styles.barHeader}>
                        <span className={Styles.barLabel}>{row.label}</span>
                        <span className={Styles.barValue}>{row.count} ({row.percent}%)</span>
                    </div>
                    <div className={Styles.track}>
                        <div
                            className={Styles.fill}
                            style={{width: `${row.percent}%`, background: row.color || DEFAULT_COLOR}}
                        />
                    </div>
                </div>
            </div>
        )}
        {collapsible && rows.length > COLLAPSED_COUNT
            ? <button className={Styles.moreButton} onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Свернуть' : `Показать все (${rows.length})`}
            </button>
            : null
        }
    </div>
}

// Диапазон вундов: полоса от минимума до максимума и метка среднего
const WoundsRow = ({row, scaleMax}) => {
    if (!row.count) {
        return <div className={Styles.woundsRow}>
            <span className={Styles.woundsLabel} style={{color: Constants.grandAlliances[row.name]?.color}}>{row.name}</span>
            <span className={Styles.woundsEmpty}>нет данных</span>
        </div>
    }
    const left = (row.min / scaleMax) * 100
    const width = Math.max(((row.max - row.min) / scaleMax) * 100, 1.5)
    const avgLeft = (row.avg / scaleMax) * 100
    return <div className={Styles.woundsRow}>
        <div className={Styles.barHeader}>
            <span className={Styles.woundsLabel} style={{color: Constants.grandAlliances[row.name]?.color}}>{row.name}</span>
            <span className={Styles.barValue}>среднее {row.avg} ({row.min}–{row.max})</span>
        </div>
        <div className={Styles.track}>
            <div className={Styles.range} style={{left: `${left}%`, width: `${width}%`, background: Constants.grandAlliances[row.name]?.color}} />
            <div className={Styles.avgMark} style={{left: `${avgLeft}%`}} />
        </div>
    </div>
}

const Statistics = () => {
    // Считаем один раз при открытии экрана
    const stats = useMemo(() => calcPreTournamentStats(players?.data || []), [])
    const {total, grandAlliances, armies, wounds, drops, tactics} = stats

    if (!total) {
        return <div id='column' className='Chapter'>
            <p className={Styles.empty}>Ростеры пока не сданы</p>
        </div>
    }

    const grandAllianceRows = map(grandAlliances, (item) => ({
        key: item.name,
        label: item.name,
        count: item.count,
        percent: item.percent,
        color: Constants.grandAlliances[item.name]?.color,
    }))

    const armyRows = map(armies, (item) => ({
        key: item.name,
        label: item.name,
        count: item.count,
        percent: item.percent,
        color: Constants.grandAlliances[item.grandAlliance]?.color,
        imageSrc: getArmyImage(item.name) || null,
    }))

    const tacticRows = map(tactics.cards, (item) => ({
        key: item.name,
        label: item.name,
        count: item.count,
        percent: item.percent,
    }))

    const maxDrops = Math.max(...map(drops.histogram, 'count'), 1)

    return <div>
        <p className={Styles.summary}>Всего участников: <b>{total}</b></p>
        <Section title='Гранд Альянсы'>
            <BarList rows={grandAllianceRows} />
        </Section>
        <Section title='Армии'>
            <BarList rows={armyRows} collapsible />
        </Section>
        <Section
            title='Вунды в ростерах'
            hint={wounds.overallAvg ? `В среднем по турниру: ${wounds.overallAvg}` : null}
        >
            {map(wounds.byAlliance, (row) => <WoundsRow key={row.name} row={row} scaleMax={wounds.scaleMax || 1} />)}
            {wounds.most
                ? <p className={Styles.fact}>Больше всего вундов: <b>{wounds.most.fullName}</b> ({wounds.most.value})</p>
                : null
            }
            {wounds.fewest
                ? <p className={Styles.fact}>Меньше всего вундов: <b>{wounds.fewest.fullName}</b> ({wounds.fewest.value})</p>
                : null
            }
        </Section>

        <Section title='Дропы' hint={drops.avg !== null ? `В среднем: ${drops.avg}` : null}>
            <div className={Styles.histogram}>
                {map(drops.histogram, (item) =>
                    <div key={item.drops} className={Styles.column}>
                        <div className={Styles.columnBarWrap}>
                            <div className={Styles.columnBar} style={{height: `${(item.count / maxDrops) * 100}%`}}>
                                <span className={Styles.columnCount}>{item.count}</span>
                            </div>
                        </div>
                        <span className={Styles.columnLabel}>{item.drops}</span>
                    </div>
                )}
            </div>
        </Section>

        <Section title='Тактики'>
            <BarList rows={tacticRows} collapsible />
            {tactics.pairs.length
                ? <>
                    <p className={Styles.subTitle}>Повторяющиеся пары</p>
                    {map(tactics.pairs, (pair) =>
                        <p key={pair.names.join('|')} className={Styles.pair}>
                            {pair.names.join(' + ')} <b>×{pair.count}</b>
                        </p>
                    )}
                </>
                : null
            }
        </Section>
    </div>
}

export default Statistics