import React, {useEffect, useState} from 'react'

import Styles from './styles/MissionDraw.module.css'

const STEPS = 32 // сколько раз подсветка переходит с миссии на миссию
const REVEAL_MS = 8000 // сколько держим результат на экране

// Задержка перед следующим шагом растёт: подсветка сначала мелькает, потом замедляется и «останавливается» на результате
const getDelay = (step) => 60 + Math.pow(step / STEPS, 3) * 520

// Жеребьёвка миссии для большого экрана. title появляется, когда результат сохранён: до этого показываем ожидание
const MissionDraw = ({pool, title, error, onDone}) => {
    const [active, setActive] = useState(-1)
    const [isRevealed, setIsRevealed] = useState(false)

    useEffect(() => {
        if (!title) return undefined
        const target = pool.indexOf(title)
        // стартовую позицию подбираем так, чтобы последний шаг пришёлся ровно на выпавшую миссию
        const start = (((target - (STEPS - 1)) % pool.length) + pool.length) % pool.length
        let step = 0
        let timer
        const tick = () => {
            setActive((start + step) % pool.length)
            step += 1
            if (step < STEPS) {
                timer = setTimeout(tick, getDelay(step))
            } else {
                timer = setTimeout(() => {
                    setIsRevealed(true)
                    timer = setTimeout(onDone, REVEAL_MS)
                }, 700)
            }
        }
        tick()
        return () => clearTimeout(timer)
    // eslint-disable-next-line
    }, [title])

    const current = active >= 0 ? pool[active] : null

    return <div className={`${Styles.overlay} ${isRevealed ? Styles.revealed : ''}`} onClick={error || isRevealed ? onDone : undefined}>
        <p className={Styles.caption}>{error ? 'Не получилось определить миссию' : 'Миссия следующего тура'}</p>
        <p className={`${Styles.name} ${isRevealed ? Styles.nameFinal : ''}`} key={isRevealed ? 'final' : current}>
            {error ? error : isRevealed ? title : current || 'Определяем…'}
        </p>
        <div className={Styles.chips}>
            {pool.map((item, index) =>
                <span
                    key={item}
                    className={`${Styles.chip} ${index === active ? Styles.chipActive : ''} ${isRevealed ? (item === title ? Styles.chipWinner : Styles.chipDim) : ''}`}
                >
                    {item}
                </span>
            )}
        </div>
        {error || isRevealed ? <p className={Styles.close}>Нажмите, чтобы закрыть</p> : null}
    </div>
}

export default MissionDraw
