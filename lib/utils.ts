import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_') // spaces → dashes
        .replace(/[^\w-]+/g, '') // remove non-word chars
        .replace(/--+/g, '_') // collapse multiple dashes

export const strlimit = (text: string, max: number): string =>
    text.length <= max ? text : `${text.slice(0, max - 3)}...`

export const formatRupiah = (value: any): string =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

export const formatDate = (date: string) => {
    const dateObj = new Date(date)
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(dateObj)
}

export const formatMonthYear = (date: string) => {
    const dateObj = new Date(date)
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit'
    }).format(dateObj)
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const toObject = (path: string, value: any) => {
    const keys = path.split('.')
    const result: any = {}
    let curr = result

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]

        if (i === keys.length - 1) {
            curr[key] = value
        } else {
            curr[key] = {}
            curr = curr[key]
        }
    }

    return result
}

export const fullName = (name: string, prefix: string | null, suffix: string | null) => {
    return `${prefix ? `${prefix} ` : ''}${name}${suffix ? `, ${suffix}` : ''}`
}

export const getDate = (date: string | number): string => {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    return `${year}-${month}-${date}`
}
