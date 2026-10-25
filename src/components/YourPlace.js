import React from 'react'

import Styles from './styles/YourPlace.module.css'

const YourPlace = ({standing, playerId, onOpen}) => {
    if (playerId === undefined || playerId === null || playerId === '') return null

    const list = standing || []
    const index = list.findIndex((p) => String(p.id) === String(playerId))
    if (index === -1) return null

    const me = list[index]
    const place = me.place ?? index + 1
    const above = index > 0 ? list[index - 1] : null
    const gap = above ? above.tp_sum - me.tp_sum : null

    let hint
    if (!above) {
        hint = 'Вы лидируете в турнире'
    } else if (gap > 0) {
        hint = `До ${above.place ?? index} места не хватает ${gap}\u00A0ТО`
    } else {
        hint = ''
    }

    return <button className={Styles.container} onClick={onOpen(me)}>
        <div className={Styles.place}>
            <span className={Styles.placeNumber}>{place}</span>
            <span className={Styles.placeTotal}>из {list.length}</span>
        </div>
        <div className={Styles.info}>
            <p className={Styles.label}>Ваше место</p>
            <p className={Styles.points}>{me.tp_sum}{'\u00A0'}ТО</p>
            {hint ? <p className={Styles.hint}>{hint}</p> : null}
        </div>
    </button>
}

export default YourPlace
