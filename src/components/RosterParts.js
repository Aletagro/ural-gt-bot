import React from 'react'

import InfoIcon from '../icons/InfoIcon'

import Styles from './styles/RosterParts.module.css'

const Svg = ({children, size = 14, width = 2.6}) => <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={width} strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    {children}
</svg>

export const Chevron = () => <span className={Styles.chevron}><Svg><path d='M9 5l7 7-7 7' /></Svg></span>

const PlusIcon = () => <span className={Styles.chevron}><Svg><path d='M12 5v14M5 12h14' /></Svg></span>

// Карточка с набором строк-параметров
export const Facts = ({children}) => <div className={Styles.facts}>{children}</div>

// Строка параметра: подпись, значение, переход. isEmpty - значение ещё не выбрано, onInfo - отдельная кнопка описания
export const Fact = ({label, value, onClick, onInfo, isEmpty}) => <div className={Styles.fact}>
    <button type='button' className={Styles.factMain} onClick={onClick}>
        <span className={Styles.factText}>
            <span className={Styles.factLabel}>{label}</span>
            <span className={`${Styles.factValue} ${isEmpty ? Styles.factEmpty : ''}`}>{value}</span>
        </span>
        {isEmpty ? <PlusIcon /> : onInfo ? null : <Chevron />}
    </button>
    {onInfo
        ? <button type='button' className={Styles.infoButton} onClick={onInfo} aria-label='Описание'><InfoIcon /></button>
        : null
    }
</div>

// Сводка по армии: тёмная шапка (ведёт в правила армии) и плитки со статистикой
export const SummaryCard = ({alliance, army, onClick, children}) => <div className={Styles.summary}>
    <button type='button' className={Styles.summaryHead} onClick={onClick}>
        <span className={Styles.summaryTitle}>
            <span className={Styles.alliance}>{alliance}</span>
            <span className={Styles.army}>{army}</span>
        </span>
        <span className={Styles.rulesHint}><Chevron /></span>
    </button>
    <div className={Styles.stats}>{children}</div>
</div>

export const Stat = ({label, value, isOver, onClick}) => {
    const content = <>
        <span className={`${Styles.statValue} ${isOver ? Styles.over : ''}`}>{value}</span>
        <span className={Styles.statLabel}>{label}</span>
    </>
    return onClick
        ? <button type='button' className={`${Styles.stat} ${Styles.statButton}`} onClick={onClick}>{content}</button>
        : <span className={Styles.stat}>{content}</span>
}

// Подложка группы в стиле регимента: тёмная шапка и тонированное тело
export const Group = ({title, subtitle, children}) => <section className={Styles.group}>
    <div className={Styles.groupHead}>
        <span className={Styles.groupTitle}>{title}</span>
        {subtitle ? <span className={Styles.groupSubtitle}>{subtitle}</span> : null}
    </div>
    <div className={Styles.groupBody}>
        {children}
    </div>
</section>
