import React from 'react'
// import {useNavigate} from 'react-router-dom'
// import Constants from '../Constants'

// import find from 'lodash/find'

import Styles from './styles/TournamentRules.module.css'

const TournamentRules = () => {
    // const navigate = useNavigate()

    // const handleClickBattleplan = (battleplan) => () => {
    //     navigate('/battleplan', {state: {title:battleplan.title, battleplan}})
    // }

    // const renderBattleplan = (battleplan) =>
    //     <button id={Styles.battleplan} onClick={handleClickBattleplan(battleplan)}>{battleplan.title}</button>

    return <div id='column' className='Chapter'>
        <p id={Styles.text}>Формат турнира — 2000 очков, Battlepack из General Handbook 2024: Pitched Battles 2024-25. Турнир проходит в пять раундов по швейцарской системе.</p>
        <p id={Styles.text}>Играем с учетом официальных FAQ, опубликованных до 11 апреля включительно. Также используется FAQ организации судей российских турниров</p>
        <p id={Styles.text}>Подача ростера. Подайте ростер до 23:59 11 апреля. Ростер необходимо подать, через данное приложение</p>
        <h2>13 апреля</h2>
        <table>
        <tr>
            <th>Время</th>
            <th>Событие</th>
            {/* <th>Battleplan</th> */}
        </tr>
        <tr>
            <td>9:00 - 10:00</td>
            <td>Регистрация</td>
            {/* <td></td> */}
        </tr>
        <tr>
            <td>10:00 - 12:45</td>
            <td>1 тур</td>
            {/* <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Feral Foray']))}</td> */}
        </tr>
        <tr>
            <td>13:45 - 16:30</td>
            <td>2 тур</td>
            {/* <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'The Vice']))}</td> */}
        </tr>
        <tr>
            <td>17:00 - 19:45</td>
            <td>3 тур</td>
            {/* <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Focal Points']))}</td> */}
        </tr>
        </table>
        <h2>14 апреля</h2>
        <table>
            <tr>
                <th>Время</th>
                <th>Событие</th>
                {/* <th>Battleplan</th> */}
            </tr>
            <tr>
                <td>10:00 - 12:45</td>
                <td>4 тур</td>
                {/* <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'The Jaws of Gallet']))}</td> */}
            </tr>
            <tr>
                <td>13:45 - 16:30</td>
                <td>5 тур</td>
                {/* <td>{renderBattleplan(find(Constants.tournamentBattleplans, ['title', 'Limited Resources']))}</td> */}
            </tr>
            <tr>
                <td>17:00 - 17:15</td>
                <td>Награждение</td>
                {/* <td></td> */}
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
        <p id={Styles.text}><b>Временной регламент</b> Каждый раунд длится 2 часа 45 минут</p>
        <b id={Styles.text}>Номинации турнира</b>
        <p id={Styles.text}>Победителем турнира станет игрок с максимальным количеством побед. В случае равенства по этому критерию выше окажется игрок с большим количеством ничьих. Если побед и ничьих поровну, то выше окажется игрок с максимальной суммой ТО. В случае равного количества TO игроки будут распределены по силе их оппонентов</p>
    </div>
}

export default TournamentRules