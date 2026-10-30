import React, {useRef} from 'react'
import {useNavigate} from 'react-router-dom'

import {player, meta} from '../utilities/appState'
import RoundTimer from './RoundTimer'
import Image from '../images/IceHammer.png'

import map from 'lodash/map'
import filter from 'lodash/filter'
import size from 'lodash/size'

import Styles from './styles/MainMenu.module.css'

// Пункт, который судья видит всегда, а игроки пока нет (shownToPlayers: показывается ли он игрокам сейчас)
const hiddenFromPlayers = (shownToPlayers) => Boolean(player.isJudge && !shownToPlayers)

const getRoleLabel = () => {
    if (player.isJudge) return 'Организатор'
    if (player.reg) return 'Участник'
    return 'Гость'
}

const getStatusLabel = () => {
    if (meta.round) return `Раунд ${meta.round} · ${meta.isRoundActive ? 'идёт игра' : 'перерыв'}`
    if (meta.isRegOpen) return 'Идёт регистрация'
    return 'Подготовка к турниру'
}

const MenuRow = ({item}) => {
    const navigate = useNavigate()
    const {title, hint, to, state, onClick, primary, judgeOnly, danger} = item

    const handleClick = () => {
        if (to) navigate(`/${to}`, {state: {title, ...state}})
        if (onClick) onClick()
    }

    const className = [
        Styles.row,
        primary ? Styles.primary : '',
        danger ? Styles.danger : '',
        judgeOnly ? Styles.judgeOnly : '',
    ].join(' ')

    return <button className={className} onClick={handleClick}>
        <span className={Styles.body}>
            <span className={Styles.title}>{title}</span>
            {hint ? <span className={Styles.hint}>{hint}</span> : null}
            {judgeOnly ? <span className={Styles.judgeChip}>Скрыто от игроков</span> : null}
        </span>
        {to ? <span className={Styles.chevron} aria-hidden='true' /> : null}
    </button>
}

const SECRET_TAPS = 7 // столько нажатий подряд на баннер открывают экран разработчика
const SECRET_TAP_GAP_MS = 1500 // пауза между нажатиями, после которой счёт начинается заново

// Главное меню: шапка со статусом и пункты, собранные в группы. Условия показа те же, что были раньше
const MainMenu = ({isPlayerInWaitingList, onCallJudge, onOpenDrop}) => {
    const navigate = useNavigate()
    const taps = useRef({count: 0, last: 0})

    // Скрытый вход на /developer: SECRET_TAPS нажатий подряд на баннер
    const handleBannerTap = () => {
        const now = Date.now()
        taps.current.count = now - taps.current.last > SECRET_TAP_GAP_MS ? 1 : taps.current.count + 1
        taps.current.last = now
        if (taps.current.count >= SECRET_TAPS) {
            taps.current.count = 0
            navigate('/developer', {state: {title: 'Разработчик'}})
        }
    }

    const sections = [
        {
            key: 'now',
            title: 'Сейчас',
            items: [
                {show: player.reg && meta.isRoundActive, title: 'Ваша Игра', hint: `Раунд ${meta.round}`, to: 'play', primary: true},
                {show: meta.isRoundActive && player.reg, title: 'Вызвать Судью', onClick: onCallJudge, danger: true},
                {
                    show: player.reg && meta.round === 5 && !player?.info?.sport_voted,
                    title: 'Голосование За Спортивность', to: 'vote',
                },
                {
                    show: player.reg && ((meta.round === 4 && !meta.isRoundActive) || meta.round === 5) && !player?.info?.paint_voted,
                    title: 'Голосование За Покрас', to: 'paintVote',
                },
            ],
        },
        {
            key: 'admin',
            title: 'Организатору',
            items: [
                {show: player.isJudge, title: 'Кабинет Организатора', to: 'admin'},
            ],
        },
        {
            key: 'tournament',
            title: 'Турнир',
            items: [
                {show: meta.round, title: 'Раунды', to: 'rounds', state: {title: 'Ice Hammer 2026', round: meta.round}},
                {
                    show: player.isJudge || meta.isPlayersListShow,
                    title: meta.round ? 'Турнирная Таблица' : 'Список участников', to: 'players',
                    judgeOnly: hiddenFromPlayers(meta.isPlayersListShow),
                },
                {
                    show: player.isJudge || meta.round,
                    title: 'Лидеры турнира', to: 'leaders',
                    judgeOnly: hiddenFromPlayers(meta.round),
                },
                {
                    show: meta.isRostersShow || player.isJudge,
                    title: 'Статистика Турнира', to: 'statisticsTabs',
                    judgeOnly: hiddenFromPlayers(meta.isRostersShow),
                },
                {
                    show: meta.isRostersShow || player.isJudge,
                    title: 'Ростера', to: 'rosters',
                    judgeOnly: hiddenFromPlayers(meta.isRostersShow),
                },
            ],
        },
        {
            key: 'my',
            title: 'Мой ростер и армия',
            items: [
                {show: player.reg && player.roster, title: 'Ваш ростер', to: 'roster', state: {isInfo: true}},
                {
                    show: meta.rostersBeingAccepted && player.reg && !isPlayerInWaitingList,
                    title: player.roster ? 'Поменять ростер' : 'Подать ростер', to: 'chooseGrandAlliance',
                },
                {
                    show: player.isJudge || (meta.rostersBeingAccepted && player.reg),
                    title: 'Фотовалидация Армии', to: 'photovalidation',
                    judgeOnly: hiddenFromPlayers(meta.rostersBeingAccepted),
                },
                {
                    show: player.isJudge || meta.isChallengesOpen,
                    title: 'Челленджи', to: 'challenges',
                    judgeOnly: hiddenFromPlayers(meta.isChallengesOpen),
                },
                {show: player.reg, title: 'Подать заявку в конкурс Покраса', to: 'paintVoteReg'},
            ],
        },
        {
            key: 'help',
            title: 'Правила и помощь',
            items: [
                {show: true, title: 'Правила', to: 'mainRules'},
                {show: true, title: 'Калькулятор Урона', to: 'calculator'},
                {
                    show: player.isJudge || meta.isTournamentRulesShow,
                    title: 'Регламент Ice Hammer 2026', to: 'tournamentRules',
                    judgeOnly: hiddenFromPlayers(meta.isTournamentRulesShow),
                },
                {show: true, title: 'Подсказка во время игры', to: 'help'},
            ],
        },
    ]

    const visibleSections = filter(
        map(sections, (section) => ({...section, items: filter(section.items, 'show')})),
        (section) => size(section.items)
    )
    // сюда незарегистрированный попадает только когда регистрация закрыта
    const isRegFailed = !player.isJudge && !player.reg && !player.isGuest
    const canDrop = !meta.round && player.reg

    return <>
        <div className={Styles.hero} onClick={handleBannerTap}>
            <img className={Styles.heroImage} src={Image} alt='Ice Hammer 2026' />
            <div className={Styles.heroShade} />
            <div className={Styles.heroBottom}>
                <RoundTimer variant='hero' fallback={<span className={Styles.statusPill}>{getStatusLabel()}</span>} />
                <span className={Styles.rolePill}>{getRoleLabel()}</span>
            </div>
        </div>

        <div className={Styles.menu}>
            {isPlayerInWaitingList
                ? <div className={`${Styles.notice} ${Styles.noticeWarning}`}>Вы находитесь в листе ожидания, организаторы свяжутся с вами</div>
                : null
            }
            {isRegFailed
                ? <div className={`${Styles.notice} ${Styles.noticeError}`}>Вы ещё не зарегистрированы, попробуйте ещё раз или обратитесь к организаторам</div>
                : null
            }
            {map(visibleSections, (section) =>
                <section key={section.key} className={Styles.section}>
                    <h4 className={Styles.sectionTitle}><span>{section.title}</span></h4>
                    {map(section.items, (item) => <MenuRow key={item.title} item={item} />)}
                </section>
            )}

            {canDrop
                ? <button className={Styles.dropButton} onClick={onOpenDrop}>Отказаться от участия на турнире</button>
                : null
            }
        </div>
    </>
}

export default MainMenu
