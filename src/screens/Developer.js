import React, {useState} from 'react'

const tg = window.Telegram?.WebApp

const yes = (value) => (value ? 'да' : 'нет')

// Что умеет это устройство: помогает понять, почему не работает «Поделиться» и скачивание
const getCapabilities = () => {
    let canShareFiles = false
    try {
        const probe = new File(['x'], 'probe.png', {type: 'image/png'})
        canShareFiles = Boolean(navigator.share && navigator.canShare && navigator.canShare({files: [probe]}))
    } catch (e) {
        canShareFiles = false
    }
    let canSharePdf = false
    try {
        const probe = new File(['x'], 'probe.pdf', {type: 'application/pdf'})
        canSharePdf = Boolean(navigator.share && navigator.canShare && navigator.canShare({files: [probe]}))
    } catch (e) {
        canSharePdf = false
    }
    return [
        ['платформа Telegram', tg?.platform || 'не в Telegram'],
        ['версия Telegram Mini Apps', tg?.version || '-'],
        ['navigator.share', yes(navigator.share)],
        ['поделиться картинкой (png)', yes(canShareFiles)],
        ['поделиться файлом (pdf)', yes(canSharePdf)],
        ['tg.downloadFile (версия 8.0+)', yes(tg?.isVersionAtLeast?.('8.0') && tg?.downloadFile)],
        ['clipboard.writeText', yes(navigator.clipboard?.writeText)],
        ['wakeLock', yes('wakeLock' in navigator)],
        ['userAgent', navigator.userAgent],
    ]
}

const Developer = () => {
    const [capabilities] = useState(getCapabilities)
    return <div style={{padding: 8}}>
        <p><b>Возможности устройства</b></p>
        {capabilities.map(([name, value]) => <p key={name}>{name}: <b>{String(value)}</b></p>)}
        <p style={{marginTop: 12}}>viewportHeight: {tg?.viewportHeight}</p>
    </div>
}

export default Developer
