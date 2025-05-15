import React from 'react'
import {useNavigate} from 'react-router-dom'
import Constants from '../Constants'

import find from 'lodash/find'

import Styles from './styles/TournamentRules.module.css'

const TournamentRules = () => {
    const navigate = useNavigate()

    const handleClickBattleplan = (battleplan) => () => {
        navigate('/battleplan', {state: {title:battleplan.title, battleplan}})
    }

    const renderBattleplan = (battleplan) =>
        <button id={Styles.battleplan} onClick={handleClickBattleplan(battleplan)}>{battleplan.title}</button>

    return <div id='column' className='Chapter'>
        <p id={Styles.text}>Формат турнира — 2000 очков, Battlepack из General Handbook 2024: Pitched Battles 2024-25. Турнир проходит в пять раундов по швейцарской системе.</p>
        <p id={Styles.text}>Играем с учетом официальных FAQ, опубликованных до 7 июня включительно. Также используется FAQ организации судей российских турниров</p>
        <p id={Styles.text}>Главные судьи турнира — Артем Петров и Георгий Королев. У главных судей будет несколько судей-помощников, мы познакомим вас с ними вначале турнира.</p>
        <p id={Styles.text}>Подача ростера. Подайте ростер до 23:59 18 июня. Ростер необходимо подать, через данное приложение</p>
        <h2>21 июня</h2>
        <table>
        <tr>
            <th>Время</th>
            <th>Событие</th>
            <th>Battleplan</th>
        </tr>
        <tr>
            <td>9:00 - 10:00</td>
            <td>Регистрация</td>
            <td></td>
        </tr>
        <tr>
            <td>10:00 - 13:00</td>
            <td>1 тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Border War']))}</td>
        </tr>
        <tr>
            <td>14:00 - 17:00</td>
            <td>2 тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Feral Foray']))}</td>
        </tr>
        <tr>
            <td>17:30 - 20:30</td>
            <td>3 тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'The Vice']))}</td>
        </tr>
        </table>
        <h2>22 июня</h2>
        <table>
            <tr>
                <th>Время</th>
                <th>Событие</th>
                <th>Battleplan</th>
            </tr>
            <tr>
                <td>10:00 - 13:00</td>
                <td>4 тур</td>
                <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Focal Points']))}</td>
            </tr>
            <tr>
                <td>14:00 - 17:00</td>
                <td>5 тур</td>
                <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'The Jaws of Gallet']))}</td>
            </tr>
            <tr>
                <td>17:30 - 18:00</td>
                <td>Награждение</td>
                <td></td>
            </tr>
        </table>
        <p id={Styles.text}><b>Подсчет очков.</b> За партию можно получить 20 турнирных очков, которые делятся между игроками следующим образом:</p>
        <ul>
            <li>ничья означает счет 10-10;</li>
            <li>победа с отрывом не более 4 очков означает счет 11-9;</li>
            <li>победа с отрывом в 5-8 очков — счет 12-8;</li>
            <li>победа с отрывом в 9-12 очков — счет 13-7;</li>
            <li>победа с отрывом в 13-16 очков — счет 14-6;</li>
            <li>победа с отрывом в 17-20 очков — счет 15-5;</li>
            <li>победа с отрывом в 21-24 очка — счет 16-4;</li>
            <li>победа с отрывом в 25-28 очков — счет 17-3;</li>
            <li>победа с отрывом в 29-32 очка — счет 18-2;</li>
            <li>победа с отрывом в 33-36 очков — счет 19-1;</li>
            <li>разгром с отрывом 37 и более очков — счет 20-0</li>
        </ul>
        <p id={Styles.text}><b>Турнирные взносы.</b> Взнос за участие в турнире составляет 2500 рублей</p>
        <p id={Styles.text}>Кроме основного взноса, не откажемся от добровольных пожертвований, где постараемся вложить средства в турнир и ваше комфортное на нем пребывание</p>
        <p id={Styles.text}><b>Временной регламент</b> Каждый раунд длится 3 часа</p>
        <b id={Styles.text}>Номинации турнира</b>
        <p id={Styles.text}><b>Победитель Стрелки</b> - Победитель турнира</p>
        <p id={Styles.text}><b>Красоты Столицы Закатов</b> - самая красивая армия</p>
        <p id={Styles.text}><b>Дружок-Пирожок</b> - самый приятный оппонент</p>
        <p id={Styles.text}><b>Слезы оппонента</b> - игрок прошедший самый сложный турнирный путь</p>
        <b id={Styles.text}>Заключение</b>
        <p id={Styles.text}>Будем очень рады видеть Вас у нас на турнире <b>Стрелка 2025</b> По любым вопросам обращайтесь по адресу PDA_08@mail.ru и или в личные сообщения в контакте https://vk.com/id17698789 и https://vk.com/xumk0</p>
    </div>
}

export default TournamentRules