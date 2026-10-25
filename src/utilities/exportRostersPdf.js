import React from 'react'
import {pdf} from '@react-pdf/renderer'
import RostersPdf from '../components/RostersPdf'

const safeParse = (value) => {
    if (!value) return null
    if (typeof value === 'object') return value
    try {
        return JSON.parse(value)
    } catch (e) {
        console.error('Не удалось разобрать JSON', e)
        return null
    }
}

// Превращаем players.data в список для PDF: только игроки с ростером, по алфавиту
export const prepareEntries = (playersData = []) =>
    playersData
        .map((p) => ({
            id: p.id,
            surname: p.surname,
            name: p.name,
            city: p.city,
            roster: safeParse(p.roster),
            info: safeParse(p.roster_stat) || {},
        }))
        .filter((e) => e.roster)
        .sort((a, b) => `${a.surname} ${a.name}`.localeCompare(`${b.surname} ${b.name}`, 'ru'))

export const buildRostersPdf = async (playersData, tournamentName) => {
    const entries = prepareEntries(playersData)
    if (!entries.length) return null
    const blob = await pdf(<RostersPdf entries={entries} tournamentName={tournamentName} />).toBlob()
    return {blob, count: entries.length}
}

// Выдача файла: системное «Поделиться» -> обычное скачивание
export const deliverPdf = async (blob, fileName) => {
    const file = new File([blob], fileName, {type: 'application/pdf'})

    if (navigator.canShare?.({files: [file]})) {
        try {
            await navigator.share({files: [file], title: fileName})
            return 'shared'
        } catch (e) {
            if (e.name === 'AbortError') return 'cancelled'
        }
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
    return 'downloaded'
}
