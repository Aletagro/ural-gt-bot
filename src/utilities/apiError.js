// Достаёт понятный текст ошибки из ответа бэка: поддерживает {detail: '...'}, {detail: [{msg}]}, {message}, {error}, обычный текст
export const getApiErrorMessage = async (response) => {
    const fallback = `Ошибка сервера (${response.status})`
    try {
        const text = await response.text()
        if (!text) return fallback
        try {
            const data = JSON.parse(text)
            const detail = data?.detail ?? data?.message ?? data?.error
            if (typeof detail === 'string') return detail
            if (Array.isArray(detail)) {
                const messages = detail.map((item) => item?.msg || item?.message || (typeof item === 'string' ? item : '')).filter(Boolean)
                if (messages.length) return messages.join('; ')
            }
            if (detail) return JSON.stringify(detail)
            return typeof data === 'string' ? data : fallback
        } catch (e) {
            return text.length < 300 ? text : fallback
        }
    } catch (e) {
        return fallback
    }
}
