import React from 'react'
import {useNavigate} from 'react-router-dom'
import Constants from '../Constants'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import find from 'lodash/find'

import Styles from './styles/TournamentRules.module.css'

const TournamentRules = () => {
    const navigate = useNavigate()

    const handleClickBattleplan = (battleplan) => () => {
        navigate('/battleplan', {state: {title:battleplan.title, battleplan}})
    }

    const handlleClickOrgLink = () => {
        navigator.clipboard.writeText('https://vk.com/petjyah')
        toast.success('Ссылка на соц сети организаторов скопирована', Constants.toastParams)
    }

    const renderBattleplan = (battleplan) =>
        <button id={Styles.battleplan} onClick={handleClickBattleplan(battleplan)}>{battleplan?.title}</button>

    return <div id='column' className='Chapter'>
        <p id={Styles.text}>Формат турнира — 2000 очков, Battlepack из General Handbook 2024: Pitched Battles 2025-27. Турнир проходит в пять раундов по швейцарской системе.</p>
        <p id={Styles.text}>Играем с учетом официальных FAQ, опубликованных до 27 июля включительно.</p>
        <p id={Styles.text}>Главные судьи турнира — Загубин Денис и Некряченко Пётр. У главных судей будет несколько судей-помощников, мы познакомим вас с ними вначале турнира.</p>
        <p id={Styles.text}>Подача ростера. Подайте ростер до 23:59 27 июля. Ростер необходимо подать, через данное приложение. </p>
        <p id={Styles.text} onClick={handlleClickOrgLink}>Все участники турнира в обязательном порядке должны отправить фотографии своей армии/ростера в личные сообщения <p id={Styles.orgLink}>организаторам</p> так мы сможем провести модерацию, избежать спорных моментов на турнире, проверить условия покраса и наметить потенциальных победителей в соответствующей номинации. </p>
        <h2>2 августа</h2>
        <table>
        <tr>
            <th>Время</th>
            <th>Событие</th>
            <th>Battleplan</th>
        </tr>
        <tr>
            <td>9:00 - 9:30</td>
            <td>Подготовка</td>
            <td></td>
        </tr>
        <tr>
            <td>9:30 - 12:30</td>
            <td>1 тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Linked Ley Lines']))}</td>
        </tr>
        <tr>
            <td>13:30 - 16:30</td>
            <td>2 тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Roiling Roots']))}</td>
        </tr>
        <tr>
            <td>16:45 - 19:45</td>
            <td>3 тур</td>
            <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Lifecycle']))}</td>
        </tr>
        </table>
        <h2>3 августа</h2>
        <table>
            <tr>
                <th>Время</th>
                <th>Событие</th>
                <th>Battleplan</th>
            </tr>
            <tr>
                <td>10:00 - 13:00</td>
                <td>4 тур</td>
                <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Surge of Slaughter']))}</td>
            </tr>
            <tr>
                <td>14:00 - 17:00</td>
                <td>5 тур</td>
                <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Grasp of Thorns']))}</td>
            </tr>
            <tr>
                <td>18:00</td>
                <td>Награждение</td>
                <td></td>
            </tr>
        </table>
        <p id={Styles.text}><b>Подсчет очков.</b> За партию можно получить 20 турнирных очков, которые делятся между игроками следующим образом:</p>
        <ul>
            <li>ничья означает счет 10-10;</li>
            <li>минорная победа по тактикам счет 11-9;</li>
            <li>победа с отрывом не более 5 очков означает счет 12-8;</li>
            <li>победа с отрывом в 6-10 очков — счет 13-7;</li>
            <li>победа с отрывом в 11-15 очков — счет 14-6;</li>
            <li>победа с отрывом в 16-20 очков — счет 15-5;</li>
            <li>победа с отрывом в 21-25 очков — счет 16-4;</li>
            <li>победа с отрывом в 26-30 очка — счет 17-3;</li>
            <li>победа с отрывом в 31-35 очков — счет 18-2;</li>
            <li>победа с отрывом в 36-40 очка — счет 19-1;</li>
            <li>разгром с отрывом 41 и более очков — счет 20-0</li>
        </ul>
        <p id={Styles.text}>Кроме основного турнирного взноса, мы не откажемся от добровольных пожертвований, где постараемся вложить средства в турнир и ваше комфортное на нем пребывание</p>
        <p id={Styles.text}><b>Временной регламент</b> Каждый раунд длится 3 часа</p>
        <b id={Styles.text}>Номинации турнира</b>
        <p id={Styles.text}><b>1 место</b> - Победитель турнира</p>
        <b id={Styles.text}>2 место</b>
        <b id={Styles.text}>3 место</b>
        <b id={Styles.text}>Лучший игрок со счетом побед (4-1)</b>
        <b id={Styles.text}>Лучший игрок со счетом побед (3-2)</b>
        <b id={Styles.text}>Лучший игрок со счетом побед (2-3)</b>
        <b id={Styles.text}>Лучший игрок со счетом побед (1-4)</b>
        <b id={Styles.text}>Заключение</b>
        <p id={Styles.text}>Будем очень рады видеть Вас у нас на турнире <b>Wild Khan 2025</b></p>
        <ToastContainer />
    </div>
}

export default TournamentRules