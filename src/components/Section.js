import React, {useState} from 'react'

import Styles from './styles/Section.module.css'

// Блок экрана с заголовком и необязательным пояснением. collapsible: блок можно свернуть, defaultOpen задаёт начальное состояние
const Section = ({title, hint, collapsible = false, defaultOpen = true, children}) => {
    const [open, setOpen] = useState(defaultOpen)
    const head = <>
        <span className={Styles.titles}>
            <b className={Styles.title}>{title}</b>
            {hint ? <span className={Styles.hint}>{hint}</span> : null}
        </span>
        {collapsible ? <span className={`${Styles.chevron} ${open ? Styles.chevronOpen : ''}`} /> : null}
    </>

    const isOpen = !collapsible || open
    const headClass = `${Styles.head} ${isOpen ? Styles.headOpen : ''}`

    return <section className={Styles.section}>
        {collapsible
            ? <button type='button' className={`${headClass} ${Styles.headButton}`} onClick={() => setOpen(!open)} aria-expanded={open}>{head}</button>
            : <div className={headClass}>{head}</div>
        }
        {isOpen ? <div className={Styles.body}>{children}</div> : null}
    </section>
}

export default Section
