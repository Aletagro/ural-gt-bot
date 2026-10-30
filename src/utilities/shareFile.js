// Отправка и сохранение файлов. Чистые функции без React.
// Результаты shareFile: shared (поделились), cancelled (закрыли меню), unsupported (устройство не умеет),
// denied (браузер счёл, что с нажатия прошло слишком много времени), failed (другая ошибка)

export const canShareFile = (file) => {
    try {
        return Boolean(navigator.share && navigator.canShare && navigator.canShare({files: [file]}))
    } catch (e) {
        return false
    }
}

export const shareFile = async (file, {title, text} = {}) => {
    if (!canShareFile(file)) return 'unsupported'
    try {
        await navigator.share({files: [file], title, text})
        return 'shared'
    } catch (error) {
        if (error?.name === 'AbortError') return 'cancelled'
        // системное «Поделиться» работает только сразу после нажатия: если прошло несколько секунд, браузер откажет
        if (error?.name === 'NotAllowedError') return 'denied'
        console.error('Ошибка системного шеринга:', error)
        return 'failed'
    }
}

// Обычное скачивание файла. Во встроенном браузере Telegram на некоторых телефонах оно не срабатывает
export const saveFile = (blob, fileName) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30000)
}

// Что показать человеку по результату shareFile (null - ничего не показывать)
export const getShareMessage = (status, subject = 'файлом') => {
    switch (status) {
        case 'unsupported':
            return `На этом устройстве нельзя поделиться ${subject}`
        case 'denied':
            return 'Не успели: нажмите ещё раз'
        case 'failed':
            return 'Не получилось поделиться, попробуйте ещё раз'
        default:
            return null
    }
}
