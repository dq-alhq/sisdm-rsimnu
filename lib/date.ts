import type { TimeValue } from 'react-aria-components'
import { endOfMonth, getLocalTimeZone, startOfMonth, Time, today } from '@internationalized/date'

export const getTodayDate = () => {
    return today(getLocalTimeZone())
}

export const getTomorrowDate = () => {
    return today(getLocalTimeZone()).add({ days: 1 })
}

export const getNextWeekDate = () => {
    return today(getLocalTimeZone()).add({ weeks: 1 })
}

export const getFirstDayOfMonth = () => {
    return startOfMonth(today(getLocalTimeZone()))
}

export const getLastDayOfMonth = () => {
    return endOfMonth(today(getLocalTimeZone()))
}

export const get25thDayOfNextMonth = () => {
    return startOfMonth(today(getLocalTimeZone())).add({ days: 24, months: 1 })
}

export const get26thDayOfMonth = () => {
    return startOfMonth(today(getLocalTimeZone())).add({ days: 25 })
}

export const normalizeTime = (value: string | null | undefined) => {
    if (!value) return ''
    const [hours, minutes] = value.split(':')
    if (!hours || !minutes) return ''
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}

export const toMinutes = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
    return hours * 60 + minutes
}

export const formatDuration = (value: number) => {
    const hours = Math.floor(value / 60)
    const minutes = value % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

export const timeValueToString = (value: TimeValue | null) => {
    if (!value) return ''
    return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`
}

export const stringToTimeValue = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
    return new Time(hours, minutes)
}

export const parseShiftRange = (value: string) => {
    const match = value.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/)
    if (!match) return null
    return {
        startMinutes: toMinutes(match[1]),
        endMinutes: toMinutes(match[2]),
        overnight: toMinutes(match[2]) <= toMinutes(match[1])
    }
}
