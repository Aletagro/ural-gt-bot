import React, {useState, useCallback} from 'react'
import Modal from './Modal'

import map from 'lodash/map'

import Styles from './styles/PlayerCard.module.css'

// badges = {earned, locked, total} из calcPlayerCard
const PlayerBadges = ({badges}) => {
    const [showLocked, setShowLocked] = useState(false)
    const [modalData, setModalData] = useState({visible: false, title: '', text: ''})
    const {earned, locked, total} = badges

    const handleClickBadge = useCallback((badge) => () => {
        setModalData({visible: true, title: badge.caption, text: badge.how})
    }, [])

    const handleCloseModal = useCallback(() => {
        setModalData({visible: false, title: '', text: ''})
    }, [])

    return <div>
        <div className={Styles.sectionHead}>
            <p className={Styles.sectionTitle}>Достижения</p>
            <span className={Styles.sectionCount}>{earned.length} из {total}</span>
        </div>

        {earned.length
            ? <div className={Styles.badges}>
                {map(earned, (badge) =>
                    <div key={badge.id} onClick={handleClickBadge(badge)} className={`${Styles.badge} ${badge.kind === 'fun' ? Styles.badgeFun : ''}`}>
                        <span className={Styles.badgeIcon}>{badge.icon}</span>
                        <p className={Styles.badgeTitle}>{badge.title}</p>
                        <p className={Styles.badgeCaption}>{badge.caption}</p>
                    </div>
                )}
            </div>
            : <p className={Styles.badgesEmpty}>Достижения появятся по ходу турнира</p>
        }

        {locked.length
            ? <>
                <button className={Styles.moreButton} onClick={() => setShowLocked(!showLocked)}>
                    {showLocked ? 'Скрыть' : `Ещё можно получить (${locked.length})`}
                </button>
                {showLocked
                    ? <div className={Styles.lockedList}>
                        {map(locked, (badge) =>
                            <div key={badge.id} className={Styles.locked}>
                                <span className={Styles.lockedIcon}>{badge.icon}</span>
                                <div>
                                    <p className={Styles.lockedTitle}>{badge.title}</p>
                                    <p className={Styles.lockedHow}>{badge.how}</p>
                                    {badge.note ? <p className={Styles.lockedNote}>{badge.note}</p> : null}
                                </div>
                            </div>
                        )}
                    </div>
                    : null
                }
            </>
            : null
        }
        <Modal {...modalData} onClose={handleCloseModal} />
    </div>
}

export default PlayerBadges
